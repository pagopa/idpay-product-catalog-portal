import type { ProductRaw, UiProduct, ProductAdapter } from '../../services/products/types'

export const adapter: ProductAdapter = (raw: ProductRaw): UiProduct | null => {
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
    productName:
      typeof raw.productName === 'string'
        ? raw.productName
        : `${raw.brand} ${raw.model}`,
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
    category: categoryLabel[raw.category as string] ?? raw.category,
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
}
