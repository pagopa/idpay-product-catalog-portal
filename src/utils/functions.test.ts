import { describe, expect, it } from 'vitest'
import {
  getModuleDefault,
  isRecord,
  parseFolderFromViteGlobPath,
  sanitizeObject,
  sanitizeString,
  structuralValidation
} from './functions'

describe('utils/functions', () => {
  it('getModuleDefault returns default when present, otherwise module itself', () => {
    expect(getModuleDefault({ default: 123 })).toBe(123)
    expect(getModuleDefault(456)).toBe(456)
  })

  it('parseFolderFromViteGlobPath extracts first folder', () => {
    expect(parseFolderFromViteGlobPath('./bonus_decoder/adapter.ts')).toBe(
      'bonus_decoder'
    )
  })

  it('parseFolderFromViteGlobPath throws on invalid path', () => {
    expect(() => parseFolderFromViteGlobPath('invalid')).toThrow(
      'Invalid module path'
    )
  })

  it('isRecord is true only for plain objects', () => {
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord(null)).toBe(false)
    expect(isRecord([])).toBe(false)
    expect(isRecord('x')).toBe(false)
  })

  it('sanitizeString strips newlines and trims', () => {
    expect(sanitizeString(` a
`)).toBe('a')
    expect(
      sanitizeString(`a
 b `)
    ).toBe('a b')
    expect(sanitizeString(1)).toBe(1)
  })

  it('sanitizeObject sanitizes all string values', () => {
    expect(
      sanitizeObject({
        a: ` a
`,
        b: 1,
        c: `x
 y `
      })
    ).toStrictEqual({ a: 'a', b: 1, c: 'x y' })
  })

  it('structuralValidation throws when dataset is not an array', () => {
    expect(() => structuralValidation({})).toThrow('Dataset is not an array')
  })

  it('structuralValidation filters out null and non-objects', () => {
    const input = [null, 1, 'x', { a: 1 }, [1, 2], { b: 2 }]
    const out = structuralValidation(input)

    expect(out).toHaveLength(3)
    expect(out[0]).toStrictEqual({ a: 1 })
    expect(out[1]).toStrictEqual([1, 2])
    expect(out[2]).toStrictEqual({ b: 2 })
  })
})
