import type { ProductRaw, UiProduct, ProductAdapter } from '../../services/products/types'

export const adapter: ProductAdapter = (raw: ProductRaw): UiProduct | null => {
  if (
    typeof raw.brand !== 'string' ||
    typeof raw.model !== 'string' ||
    typeof raw.category !== 'string' ||
    typeof raw.gtinCode !== 'string'
  ) return null

  return {
    productName:
      typeof raw.productName === 'string'
        ? raw.productName
        : `${raw.brand} ${raw.model}`,
    productCode:
      typeof raw.productCode === 'string'
        ? raw.productCode
        : undefined,
    brand: raw.brand,
    model: raw.model,
    category: raw.category,
    gtin: raw.gtinCode
  }
}
