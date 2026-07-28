import { DEFAULT_THEME_ID, isThemeId } from './themes'

/**
 * localStorage key for the visitor's chosen theme id. Also hardcoded (it
 * cannot import this module) in the inline pre-paint script in
 * `index.html` — keep the two in sync if this ever changes.
 */
export const THEME_STORAGE_KEY = 'fm-theme'

/**
 * Reads the visitor's previously chosen theme id, if any. Returns `null`
 * when nothing is stored, storage is unavailable, or the stored value is
 * not a theme id this build recognises (e.g. left over from a removed
 * theme).
 */
export function getStoredThemeId(): string | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(stored) ? stored : null
  } catch {
    return null
  }
}

/**
 * Recolours the page by writing `data-theme` on the document root. This is
 * the only thing that ever changes to switch themes — no individual colour
 * custom property is ever set from JavaScript, so themes cannot drift out
 * of sync with the CSS blocks in `src/styles/themes.css`.
 */
export function applyTheme(themeId: string): void {
  document.documentElement.setAttribute('data-theme', themeId)
}

/** Applies a theme and persists the choice so it survives a reload. */
export function setTheme(themeId: string): void {
  applyTheme(themeId)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
  } catch {
    // Storage unavailable (private browsing, quota, etc). The theme still
    // applies for this page view; it just won't persist.
  }
}

/**
 * Applies the visitor's saved theme, or ORIGINAL if none is saved. Called
 * once on app start. The inline script in `index.html` already did this
 * before the app mounted (so there is no flash of the default theme) —
 * this call is what keeps React's mental model of "current theme" in sync
 * with whatever the document root actually has, and is a no-op in the
 * common case where the attribute already matches.
 */
export function restoreTheme(): void {
  applyTheme(getStoredThemeId() ?? DEFAULT_THEME_ID)
}
