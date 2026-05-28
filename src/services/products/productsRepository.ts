import { fetchWithResilience } from '../http/fetchWithResilience'
import { logger } from '../logging/logger'
import { getInitiativeConfig, getInitiativeAdapter, INITIATIVE_NAME } from '../../config/initiativeResolver.ts'

export type ProductRaw = Record<string, unknown>

export type UiProduct = Record<string, string | undefined>

const sanitizeString = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  return value.replace(/[\r\n]/g, '').trim()
}

const sanitizeObject = (obj: ProductRaw): ProductRaw => {
  const sanitized: ProductRaw = {}
  for (const key of Object.keys(obj)) {
    sanitized[key] = sanitizeString(obj[key])
  }
  return sanitized
}

const structuralValidation = (data: unknown): ProductRaw[] => {
  if (!Array.isArray(data)) {
    throw new Error('Dataset is not an array')
  }

  return data.filter((item) => typeof item === 'object' && item !== null) as ProductRaw[]
}

const getAdapter = () => {
  return getInitiativeAdapter()
}

export const getEligibleProducts = async (): Promise<UiProduct[]> => {
  getInitiativeConfig()
  const adapter = getAdapter()

  try {
    const { datasetFile } = getInitiativeConfig()

    if (!datasetFile) {
      throw new Error(`No dataset configured for initiative ${INITIATIVE_NAME}`)
    }

    const response = await fetchWithResilience(
      `${import.meta.env.BASE_URL}data/${datasetFile}`
    )

    const json = await response.json()
    const structurallyValid = structuralValidation(json)

    const mapped: UiProduct[] = []

    for (const raw of structurallyValid) {
      const sanitized = sanitizeObject(raw)
      const adapted = adapter(sanitized)

      if (adapted) {
        mapped.push(adapted)
      } else {
        logger.warn('Invalid product discarded')
      }
    }

    return mapped
  } catch (error) {
    logger.error(error instanceof Error ? error.message : 'Failed to load products')
    return []
  }
}
