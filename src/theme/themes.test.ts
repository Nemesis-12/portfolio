import { describe, expect, it } from 'vitest'
import { DEFAULT_THEME_ID, isThemeId, THEMES } from './themes'

describe('THEMES', () => {
  it('defines all five themes required by the spec', () => {
    expect(THEMES.map((theme) => theme.name)).toEqual([
      'ORIGINAL',
      'TERRACOTTA',
      'INDIGO',
      'PURPLE',
      'OLIVE',
    ])
  })

  it('gives every theme a unique id, a name, and three swatch colours', () => {
    const ids = new Set(THEMES.map((theme) => theme.id))
    expect(ids.size).toBe(THEMES.length)

    for (const theme of THEMES) {
      expect(theme.id).toMatch(/^[a-z]+$/)
      expect(theme.name.length).toBeGreaterThan(0)
      expect(theme.swatch).toHaveLength(3)
      for (const colour of theme.swatch) {
        expect(colour).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('defaults to ORIGINAL', () => {
    expect(DEFAULT_THEME_ID).toBe('original')
    expect(THEMES.some((theme) => theme.id === DEFAULT_THEME_ID)).toBe(true)
  })
})

describe('isThemeId', () => {
  it('accepts every known theme id', () => {
    for (const theme of THEMES) {
      expect(isThemeId(theme.id)).toBe(true)
    }
  })

  it('rejects unknown values and null', () => {
    expect(isThemeId('not-a-theme')).toBe(false)
    expect(isThemeId(null)).toBe(false)
    expect(isThemeId('')).toBe(false)
  })
})
