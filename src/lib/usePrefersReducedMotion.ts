import { useMediaQuery } from '@/lib/useMediaQuery'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Tracks the visitor's `prefers-reduced-motion` preference, live. If the OS
 * setting flips while the page is open, consumers (the header clock's tick,
 * its cursor blink, the Go board, the tagline, the pipeline loop, the
 * headline-stat counters) react immediately rather than only picking it up
 * on next load.
 *
 * Delegates the actual subscribe/read/cleanup dance to `useMediaQuery`
 * (#354) -- this hook is just that generic hook pinned to the
 * reduced-motion query. Defaults to `false` (motion allowed) in
 * environments without `matchMedia` (e.g. some test setups) rather than
 * throwing; see `useMediaQuery`'s own handling of that case. jsdom does not
 * implement `window.matchMedia` at all (it is `undefined`, not a stub).
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(QUERY)
}
