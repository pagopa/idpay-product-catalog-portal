/**
 * Multi-initiative configuration module
 * This module centralizes initiative resolution and UI configuration.
 */

export type FilterDefinition = {
  key: string
  type: 'select' | 'text'
}

export type ColumnDefinition = {
  key: string
  label: string
}

export type InitiativeConfig = {
  initiativeId: string
  basePath: string
  filters: FilterDefinition[]
  tableColumns: ColumnDefinition[]
}

/**
 * Resolve base path from Vite env.
 * Fallback for dev without pipeline.
 */
const resolveBasePath = (): string => {
  const base =
    import.meta.env.VITE_BASE_PATH ||
    import.meta.env.BASE_PATH ||
    '/elenco-informatico-elettrodomestici/'

  if (!base.startsWith('/') || !base.endsWith('/')) {
    throw new Error(
      `Invalid BASE_PATH configuration: "${base}". Must start and end with "/".`
    )
  }

  return base
}

const BASE_PATH = resolveBasePath()

export const INITIATIVE_ID = BASE_PATH.replace(/^\//, '').replace(/\/$/, '')

/**
 * Mocked registry for multi-initiative without pipeline.
 * In real production this is build-time injected.
 */
const INITIATIVE_REGISTRY: Record<string, InitiativeConfig> = {
  'bonus-elettrodomestici': {
    initiativeId: 'bonus-elettrodomestici',
    basePath: '/bonus-elettrodomestici/',
    filters: [
      { key: 'search', type: 'text' }, // Cerca modello o codice EAN
      { key: 'category', type: 'select' },
      { key: 'brand', type: 'select' },
      { key: 'energyClass', type: 'select' }
    ],
    tableColumns: [
      { key: 'category', label: 'Categoria' },
      { key: 'brand', label: 'Marca' },
      { key: 'model', label: 'Modello' },
      { key: 'gtin', label: 'Codice GTIN / EAN' },
      { key: 'eprelCode', label: 'Codice EPREL' }
    ]
  },

  'bonus-decoder': {
    initiativeId: 'bonus-decoder',
    basePath: '/bonus-decoder/',
    filters: [
      { key: 'search', type: 'text' },
      { key: 'category', type: 'select' },
      { key: 'brand', type: 'select' }
    ],
    tableColumns: [
      { key: 'category', label: 'Categoria' },
      { key: 'brand', label: 'Marca' },
      { key: 'model', label: 'Modello' },
      { key: 'gtin', label: 'Codice GTIN / EAN' }
    ]
  },

}

/**
 * Public accessor
 */
export const getInitiativeConfig = (): InitiativeConfig => {
  const config = INITIATIVE_REGISTRY[INITIATIVE_ID]

  if (!config) {
    throw new Error(
      `No initiative configuration found for initiativeId "${INITIATIVE_ID}"`
    )
  }

  return config
}
