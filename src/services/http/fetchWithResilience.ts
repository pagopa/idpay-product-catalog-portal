import { logger } from '../logging/logger'

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

type FetchOptions = RequestInit & {
  timeoutMs?: number
  retries?: number
}

const DEFAULT_TIMEOUT = 8000
const DEFAULT_RETRIES = 3
const FAILURE_THRESHOLD = 3
const COOL_DOWN_MS = 10000

let failureCount = 0
let circuitState: CircuitState = 'CLOSED'
let lastFailureTime = 0

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const shouldRetry = (response?: Response, error?: unknown): boolean => {
  if (error) return true
  if (!response) return true
  if (response.status === 429) return true
  if (response.status >= 500) return true
  return false
}

const updateCircuitOnFailure = () => {
  failureCount++
  lastFailureTime = Date.now()

  if (failureCount >= FAILURE_THRESHOLD) {
    circuitState = 'OPEN'
    logger.warn('Circuit breaker opened')
  }
}

const updateCircuitOnSuccess = () => {
  failureCount = 0
  circuitState = 'CLOSED'
}

const canRequest = (): boolean => {
  if (circuitState === 'CLOSED') return true

  if (circuitState === 'OPEN') {
    const now = Date.now()
    if (now - lastFailureTime > COOL_DOWN_MS) {
      circuitState = 'HALF_OPEN'
      logger.info('Circuit breaker half-open')
      return true
    }
    return false
  }

  if (circuitState === 'HALF_OPEN') return true

  return true
}

export const fetchWithResilience = async (
  input: RequestInfo,
  options: FetchOptions = {}
): Promise<Response> => {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT
  const retries = options.retries ?? DEFAULT_RETRIES

  if (!canRequest()) {
    throw new Error('Circuit breaker is open')
  }

  let attempt = 0
  let lastError: unknown

  while (attempt <= retries) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(input, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!shouldRetry(response)) {
        updateCircuitOnSuccess()
        return response
      }

      updateCircuitOnFailure()
      lastError = new Error(`HTTP error ${response.status}`)

      if (attempt === retries) {
        break
      }

      const backoff = Math.pow(2, attempt) * 100
      const jitter = Math.random() * 100
      await sleep(backoff + jitter)
    } catch (error) {
      clearTimeout(timeout)
      updateCircuitOnFailure()
      lastError = error

      if (attempt === retries) {
        break
      }

      const backoff = Math.pow(2, attempt) * 100
      const jitter = Math.random() * 100
      await sleep(backoff + jitter)
    }

    attempt++
  }

  logger.error('fetchWithResilience failed')
  throw lastError ?? new Error('Unknown fetch error')
}
