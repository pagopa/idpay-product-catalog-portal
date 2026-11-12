import { describe, expect, it } from 'vitest'
import { adapter } from './adapter'

const rawProduct = {
  brand: 'MarcaEsempio',
  model: 'ModelloE300',
  category: 'DT',
  gtinCode: 'GTIN001BFFF567',
}

describe('bonus decoder adapter', () => {
  it.each([
    [true, 'Sì'],
    [false, 'No'],
  ])('adapts scart=%s as %s', (scart, expected) => {
    const product = adapter({
      ...rawProduct,
      scart,
      connectivity: 'LAN e WIFI',
      technicalSheetUrl: 'https://www.google.com',
    })

    expect(product).toMatchObject({
      scart: expected,
      connectivity: 'LAN e WIFI',
      technicalSheetUrl: 'https://www.google.com',
    })
  })
})