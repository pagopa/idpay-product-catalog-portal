export type DefaultExportModule<T> = { default: T } | T
export type ExportRecord = Record<string, unknown>

export const getModuleDefault = <T,>(m: DefaultExportModule<T>): T =>
  (m as { default: T }).default ?? (m as T)

export const parseFolderFromViteGlobPath = (p: string): string => {
  const match = p.match(/^\.\/([^/]+)\//)
  if (!match) {
    throw new Error(`Invalid module path: "${p}"`)
  }
  return match[1]
}

export const isRecord = (v: unknown): v is ExportRecord =>
  !!v && typeof v === 'object' && !Array.isArray(v)

export const sanitizeString = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  return value.replace(/[\r\n]/g, '').trim()
}

export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = {} as T
  for (const key of Object.keys(obj)) {
    sanitized[key as keyof T] = sanitizeString(obj[key]) as T[keyof T]
  }
  return sanitized
}

export const structuralValidation = <T extends Record<string, unknown>>(data: unknown): T[] => {
  if (!Array.isArray(data)) {
    throw new Error('Dataset is not an array')
  }

  return data.filter((item) => typeof item === 'object' && item !== null) as T[]
}
