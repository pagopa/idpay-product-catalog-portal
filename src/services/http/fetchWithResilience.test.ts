import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../logging/logger', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}))

describe('fetchWithResilience', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-29T10:00:00.000Z'))
    vi.stubGlobal('AbortController', class AbortControllerMock {
      signal = {}
      abort = vi.fn()
    } as unknown as typeof AbortController)
  })

  it('returns response immediately when ok and does not retry', async () => {
    const { fetchWithResilience } = await import('./fetchWithResilience')

    const response = new Response('ok', { status: 200 })
    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      response
    )

    const p = fetchWithResilience('/test', { retries: 3, timeoutMs: 1000 })
    await vi.runAllTimersAsync()

    await expect(p).resolves.toBe(response)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('retries on 500 and then succeeds, resetting circuit breaker', async () => {
    const { fetchWithResilience } = await import('./fetchWithResilience')

    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(new Response('err', { status: 500 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))

    const p = fetchWithResilience('/test', { retries: 2, timeoutMs: 1000 })
    await vi.runAllTimersAsync()

    const res = await p
    expect(res.status).toBe(200)
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('opens circuit breaker after 3 failures and blocks subsequent requests until cooldown', async () => {
    const { fetchWithResilience } = await import('./fetchWithResilience')

    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('err', { status: 500 })
    )

    await expect(
      fetchWithResilience('/test', { retries: 0, timeoutMs: 1000 })
    ).rejects.toBeTruthy()
    await expect(
      fetchWithResilience('/test', { retries: 0, timeoutMs: 1000 })
    ).rejects.toBeTruthy()
    await expect(
      fetchWithResilience('/test', { retries: 0, timeoutMs: 1000 })
    ).rejects.toBeTruthy()
    await vi.runAllTimersAsync()

    await expect(
      fetchWithResilience('/test', { retries: 0, timeoutMs: 1000 })
    ).rejects.toThrow('Circuit breaker is open')

    vi.setSystemTime(new Date('2026-05-29T10:00:30.000Z'))
    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('ok', { status: 200 })
    )

    const p4 = fetchWithResilience('/test', { retries: 0, timeoutMs: 1000 })
    await vi.runAllTimersAsync()
    await expect(p4).resolves.toBeInstanceOf(Response)
  })

  it(
    'retries on thrown error and finally logs and throws last error',
    async () => {
      const { fetchWithResilience } = await import('./fetchWithResilience')

      const err = new Error('network')
      ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
        err
      )

      const p = fetchWithResilience('/test', { retries: 2, timeoutMs: 1000 })
      p.catch(() => undefined)

      await vi.runAllTimersAsync()
      await expect(p).rejects.toBe(err)

      expect(globalThis.fetch).toHaveBeenCalledTimes(3)
    },
    15000
  )

  it('retries on 429 responses', async () => {
    const { fetchWithResilience } = await import('./fetchWithResilience')

    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(new Response('rate', { status: 429 }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))

    const p = fetchWithResilience('/test', { retries: 1, timeoutMs: 1000 })
    await vi.runAllTimersAsync()

    const res = await p
    expect(res.status).toBe(200)
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('does not retry on 400 responses', async () => {
    const { fetchWithResilience } = await import('./fetchWithResilience')

    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      new Response('bad', { status: 400 })
    )

    const p = fetchWithResilience('/test', { retries: 3, timeoutMs: 1000 })
    await vi.runAllTimersAsync()

    const res = await p
    expect(res.status).toBe(400)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('retries when fetch resolves to undefined response', async () => {
    const { fetchWithResilience } = await import('./fetchWithResilience')

    ;(globalThis.fetch as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(new Response('ok', { status: 200 }))

    const p = fetchWithResilience('/test', { retries: 1, timeoutMs: 1000 })
    await vi.runAllTimersAsync()

    const res = await p
    expect(res.status).toBe(200)
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })
})
