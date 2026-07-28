import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_THEME_ID, THEMES } from './themes'
import { applyTheme, getStoredThemeId, restoreTheme, setTheme, THEME_STORAGE_KEY } from './persistence'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('applyTheme', () => {
  it('recolours the page by writing data-theme on the document root, nothing else', () => {
    applyTheme('terracotta')

    expect(document.documentElement.getAttribute('data-theme')).toBe('terracotta')
    // The mechanism is one attribute — no inline colour properties.
    expect(document.documentElement.style.length).toBe(0)
  })
})

describe('setTheme', () => {
  it('applies the theme immediately', () => {
    setTheme('indigo')

    expect(document.documentElement.getAttribute('data-theme')).toBe('indigo')
  })

  it('persists the choice to localStorage', () => {
    setTheme('purple')

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('purple')
  })
})

describe('getStoredThemeId', () => {
  it('returns null when nothing has been saved yet', () => {
    expect(getStoredThemeId()).toBeNull()
  })

  it('returns the previously saved theme id', () => {
    setTheme('olive')

    expect(getStoredThemeId()).toBe('olive')
  })

  it('returns null for a value that is not a recognised theme id', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'some-removed-theme')

    expect(getStoredThemeId()).toBeNull()
  })
})

describe('restoreTheme', () => {
  it('restores a saved theme on reload', () => {
    // Simulate a prior visit choosing a theme, then a fresh page load
    // where only localStorage carries the choice forward.
    setTheme('terracotta')
    document.documentElement.removeAttribute('data-theme')

    restoreTheme()

    expect(document.documentElement.getAttribute('data-theme')).toBe('terracotta')
  })

  it('gives a visitor with no saved choice the ORIGINAL theme', () => {
    restoreTheme()

    expect(document.documentElement.getAttribute('data-theme')).toBe(DEFAULT_THEME_ID)
  })

  it('restores every theme the data module knows about', () => {
    for (const theme of THEMES) {
      setTheme(theme.id)
      document.documentElement.removeAttribute('data-theme')

      restoreTheme()

      expect(document.documentElement.getAttribute('data-theme')).toBe(theme.id)
    }
  })
})
