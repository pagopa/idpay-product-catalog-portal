import type { ProductAdapter } from '../services/products/types'
import {
  getModuleDefault,
  isRecord,
  parseFolderFromViteGlobPath
} from '../utils/functions'

export type InitiativeConfig = {
  initiativeName: string
  basePath: string
  filters: { key: string; type: 'select' | 'text' }[]
  tableColumns: {
    key: string
    label: string
    sortable: boolean
    link?: {
      type: 'eprel'
    }
  }[]
  datasetFile: string
  detailFields: {
    key: string
    label: string
    formatter?: 'country'
  }[]
  copy: {
    bonusLabel: string
    realizationPrefix: string
    searchPage: {
      title: string
      description: string
    }
  }
}

const configModules = import.meta.glob('./*/config.json', { eager: true })
const adapterModules = import.meta.glob('./*/adapter.ts', { eager: true })

const configsByFolder: Record<string, InitiativeConfig> = Object.fromEntries(
  Object.entries(configModules).map(([path, mod]) => {
    const folder = parseFolderFromViteGlobPath(path)
    return [folder, getModuleDefault(mod) as InitiativeConfig]
  })
)

type AdapterModule = { adapter: ProductAdapter } | { default: ProductAdapter }

const isAdapterModule = (m: unknown): m is AdapterModule => {
  if (!isRecord(m)) return false
  return typeof m.adapter === 'function' || typeof m.default === 'function'
}

const adaptersByFolder: Record<string, ProductAdapter> = Object.fromEntries(
  Object.entries(adapterModules).map(([path, mod]) => {
    const folder = parseFolderFromViteGlobPath(path)

    if (!isAdapterModule(mod)) {
      throw new Error(`Invalid adapter export in "${path}"`)
    }

    const adapter: ProductAdapter = 'adapter' in mod ? mod.adapter : mod.default
    return [folder, adapter]
  })
)

const REGISTRY: Record<string, InitiativeConfig> = Object.fromEntries(
  Object.values(configsByFolder).map((cfg) => [cfg.initiativeName, cfg])
)

const ADAPTER_REGISTRY: Record<string, ProductAdapter> = Object.fromEntries(
  Object.entries(configsByFolder).map(([folder, cfg]) => {
    const adapter = adaptersByFolder[folder]
    if (!adapter) {
      throw new Error(
        `No adapter.ts found for initiative folder "${folder}" (initiativeName="${cfg.initiativeName}")`
      )
    }
    return [cfg.initiativeName, adapter]
  })
)

const resolveBasePath = (): string => {
  const base =
    import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_PATH || '/'

  if (!base.startsWith('/') || !base.endsWith('/')) {
    throw new Error(
      `Invalid BASE_PATH configuration: "${base}". Must start and end with "/".`
    )
  }

  return base
}

const BASE_PATH = resolveBasePath()
export const INITIATIVE_NAME = BASE_PATH.replace(/^\//, '').replace(/\/$/, '')

export const getInitiativeConfig = (): InitiativeConfig => {
  const config = REGISTRY[INITIATIVE_NAME]

  if (!config) {
    throw new Error(
      `No initiative configuration found for initiativeName "${INITIATIVE_NAME}"`
    )
  }

  return config
}

export const getInitiativeAdapter = () => {
  const adapter = ADAPTER_REGISTRY[INITIATIVE_NAME]

  if (!adapter) {
    throw new Error(`No adapter found for initiativeName "${INITIATIVE_NAME}"`)
  }

  return adapter
}
