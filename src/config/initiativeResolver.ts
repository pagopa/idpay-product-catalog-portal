import bonusElettrodomesticiJson from './bonus_elettrodomestici/config.json'
import bonusDecoderJson from './bonus_decoder/config.json'
import { adapter as elettrodomesticiAdapter } from './bonus_elettrodomestici/adapter'
import { adapter as decoderAdapter } from './bonus_decoder/adapter'

export type InitiativeConfig = {
  initiativeName: string
  basePath: string
  filters: { key: string; type: 'select' | 'text' }[]
  tableColumns: {
    key: string
    label: string
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
  }
}

const bonusElettrodomestici = bonusElettrodomesticiJson as InitiativeConfig
const bonusDecoder = bonusDecoderJson as InitiativeConfig

const resolveBasePath = (): string => {
  const base =
    import.meta.env.VITE_BASE_PATH ||
    import.meta.env.BASE_PATH;

  if (!base.startsWith('/') || !base.endsWith('/')) {
    throw new Error(
      `Invalid BASE_PATH configuration: "${base}". Must start and end with "/".`
    )
  }

  return base
}

const BASE_PATH = resolveBasePath()
export const INITIATIVE_NAME = BASE_PATH.replace(/^\//, '').replace(/\/$/, '')

const REGISTRY: Record<string, InitiativeConfig> = {
  [bonusElettrodomestici.initiativeName]: bonusElettrodomestici,
  [bonusDecoder.initiativeName]: bonusDecoder
}

const ADAPTER_REGISTRY = {
  [bonusElettrodomestici.initiativeName]: elettrodomesticiAdapter,
  [bonusDecoder.initiativeName]: decoderAdapter
}

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
    throw new Error(
      `No adapter found for initiativeName "${INITIATIVE_NAME}"`
    )
  }

  return adapter
}
