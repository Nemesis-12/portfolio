/**
 * Theme metadata for rendering a picker (issue #313).
 *
 * The full fourteen-token colour set for each theme lives in
 * `src/styles/themes.css` as one `[data-theme="..."]` block per theme —
 * that is the mechanism this data module does not duplicate. This module
 * only carries what a picker UI needs to *render*: an id to write onto
 * `data-theme`, a display name, and three swatch colours for a preview
 * dot. Adding a theme still means touching two places (a CSS block and one
 * entry here) rather than a JavaScript object holding every colour.
 */

export interface Theme {
  /** Value written to the `data-theme` attribute; matches a CSS block. */
  id: string
  /** Display name shown in the picker. */
  name: string
  /** Three representative colours (background, accent, accent-2) as hex. */
  swatch: readonly [string, string, string]
}

export const DEFAULT_THEME_ID = 'original'

export const THEMES: readonly Theme[] = [
  { id: 'original', name: 'ORIGINAL', swatch: ['#14120f', '#5468ff', '#93a0ff'] },
  { id: 'terracotta', name: 'TERRACOTTA', swatch: ['#04080f', '#e94f37', '#f5917d'] },
  { id: 'indigo', name: 'INDIGO', swatch: ['#171a26', '#566ee3', '#6f96ff'] },
  { id: 'purple', name: 'PURPLE', swatch: ['#1a1526', '#7d65d6', '#ca7ced'] },
  { id: 'olive', name: 'OLIVE', swatch: ['#191c0d', '#d0d058', '#a0a840'] },
]

const THEME_IDS = new Set(THEMES.map((theme) => theme.id))

/** Whether `value` is a known theme id (e.g. a value read back from storage). */
export function isThemeId(value: string | null): value is string {
  return value !== null && THEME_IDS.has(value)
}
