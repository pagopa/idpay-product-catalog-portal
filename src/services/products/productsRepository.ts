import { fetchWithResilience } from '../http/fetchWithResilience'
import { logger } from '../logging/logger'
import { getInitiativeConfig, INITIATIVE_NAME } from '../../config/initiativeResolver'

export type ProductRaw = Record<string, unknown>

export type UiProduct = Record<string, string | undefined>

type ProductAdapter = (raw: ProductRaw) => UiProduct | null

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

/**
 * Mock adapters per initiative
 * In production these would be separated per file.
 */
const ADAPTERS: Record<string, ProductAdapter> = {
  'bonus-elettrodomestici': (raw) => {
    if (
      typeof raw.brand !== 'string' ||
      typeof raw.model !== 'string' ||
      typeof raw.gtin !== 'string' ||
      typeof raw.category !== 'string'
    ) return null

    const categoryLabel: Record<string, string> = {
      WASHINGMACHINES: 'Lavatrice',
      WASHERDRIERS: 'Lavasciuga',
      OVENS: 'Forno',
      RANGEHOODS: 'Cappa da cucina',
      DISHWASHERS: 'Lavastoviglie',
      TUMBLEDRYERS: 'Asciugatrice',
      REFRIGERATINGAPPL: 'Apparecchio di refrigerazione',
      COOKINGHOBS: 'Piano cottura'
    }

    return {
      brand: raw.brand,
      model: raw.model,
      gtin: raw.gtin,
      productCode:
        typeof raw.productCode === 'string'
          ? raw.productCode
          : undefined,
      capacity:
        typeof raw.capacity === 'string'
          ? raw.capacity
          : undefined,
      category: categoryLabel[raw.category] ?? raw.category,
      countryOfProduction:
        typeof raw.countryOfProduction === 'string'
          ? raw.countryOfProduction
          : undefined,
      energyClass:
        typeof raw.energyClass === 'string'
          ? raw.energyClass
          : undefined,
      eprelCode:
        typeof raw.eprelCode === 'string'
          ? raw.eprelCode
          : undefined,
      productGroup:
        typeof raw.productGroup === 'string'
          ? raw.productGroup
          : undefined
    }
  },
  'bonus-decoder': (raw) => {
    if (
      typeof raw.brand !== 'string' ||
      typeof raw.model !== 'string' ||
      typeof raw.category !== 'string' ||
      typeof raw.gtinCode !== 'string'
    ) return null

    return {
      brand: raw.brand,
      model: raw.model,
      category: raw.category,
      gtin: raw.gtinCode
    }
  },
}

const getAdapter = (): ProductAdapter => {
  const adapter = ADAPTERS[INITIATIVE_NAME]
  if (!adapter) {
    throw new Error(`No adapter found for initiative ${INITIATIVE_NAME}`)
  }
  return adapter
}

export const getEligibleProducts = async (): Promise<UiProduct[]> => {
  getInitiativeConfig()
  const adapter = getAdapter()

  try {
    const datasetMap: Record<string, string> = {
      'bonus-elettrodomestici': 'bonus_elettrodomestici_product_export.json',
      'bonus-decoder': 'bonus_decoder_product_export.json',
    }

    const datasetFile = datasetMap[INITIATIVE_NAME]

    if (!datasetFile) {
      throw new Error(`No dataset mapped for initiative ${INITIATIVE_NAME}`)
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
