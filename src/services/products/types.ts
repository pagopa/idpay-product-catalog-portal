export type ProductRaw = Record<string, unknown>

export type UiProduct = Record<string, string | undefined>

export type ProductAdapter = (raw: ProductRaw) => UiProduct | null
