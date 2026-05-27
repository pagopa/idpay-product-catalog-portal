import bonusElettrodomesticiJson from './bonus_elettrodomestici/config.json'
import bonusDecoderJson from './bonus_decoder/config.json'

export type InitiativeConfig = {
  initiativeName: string
  basePath: string
  filters: { key: string; type: 'select' | 'text' }[]
  tableColumns: { key: string; label: string }[]
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
    import.meta.env.BASE_PATH ||
    '/bonus-elettrodomestici/'

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

export const getInitiativeConfig = (): InitiativeConfig => {
const config = REGISTRY[INITIATIVE_NAME]

  if (!config) {
    throw new Error(
`No initiative configuration found for initiativeName "${INITIATIVE_NAME}"`
    )
  }

  return config
}
