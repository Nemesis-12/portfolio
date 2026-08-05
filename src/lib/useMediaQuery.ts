import { useEffect, useState } from 'react'

/**
 * Single owner of media-query subscription on the JavaScript side, and of
 * the one hard breakpoint (`PANEL_QUERY`, 880px) that the rest of the app
 * cares about (#354).
 *
 * Before this module existed, three different places independently stated
 * "880px" (or reimplemented the same subscribe/read/cleanup dance around a
 * different query): `useFitToViewport`'s own `PANEL_QUERY` constant,
 * `MobileNav`'s inline `matchMedia('(min-width: 880px)')` literal, and
 * `usePrefersReducedMotion`'s hand-rolled `matchMedia` + `addEventListener`
 * + `removeEventListener` cycle around `(prefers-reduced-motion: reduce)`.
 * Everything below funnels through the same two primitives instead:
 * `queryMatches` for a synchronous read and `subscribeToMediaQuery` for the
 * live-update lifecycle. `usePanelBreakpoint` (backed by the generic
 * `useMediaQuery`) is the one place "is the viewport at/above 880px"
 * gets asked as a React hook.
 *
 * The CSS token (`--breakpoint-panel` in `src/index.css`, consumed as the
 * `panel:` variant and by `@media (min-width: 880px)` in
 * `src/styles/layout.css`) remains the authority for CSS. This module only
 * owns the JavaScript side, which cannot read a CSS custom property to
 * build a `matchMedia` query -- the string below has to be kept in sync
 * with `--breakpoint-panel` by hand, but now there is exactly one place to
 * do that instead of three.
 */
export const PANEL_QUERY = '(min-width: 880px)'

function getMql(query: string): MediaQueryList | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return undefined
  }
  return window.matchMedia(query)
}

/** Synchronous read of whether `query` currently matches. */
export function queryMatches(query: string): boolean {
  return getMql(query)?.matches ?? false
}

/**
 * Subscribes to changes in whether `query` matches, calling `onChange` with
 * the new match state on every change. Returns the cleanup function; a
 * no-op subscription (and no-op cleanup) is returned in environments
 * without `matchMedia` (e.g. some test setups) rather than throwing.
 */
export function subscribeToMediaQuery(query: string, onChange: (matches: boolean) => void): () => void {
  const mql = getMql(query)
  if (!mql) return () => {}

  const listener = () => onChange(mql.matches)
  mql.addEventListener('change', listener)
  return () => mql.removeEventListener('change', listener)
}

/** Tracks whether `query` currently matches, live. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => queryMatches(query))

  useEffect(() => subscribeToMediaQuery(query, setMatches), [query])

  return matches
}

/** Tracks whether the viewport is at/above the 880px `panel:` breakpoint, live. */
export function usePanelBreakpoint(): boolean {
  return useMediaQuery(PANEL_QUERY)
}
