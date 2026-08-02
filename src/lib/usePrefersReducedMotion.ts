import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getInitialValue(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(QUERY).matches
}

/**
 * Tracks the visitor's `prefers-reduced-motion` preference, live. If the OS
 * setting flips while the page is open, consumers (the header clock's tick,
 * its cursor blink, the Go board, the tagline, the pipeline loop, the
 * headline-stat counters) react immediately rather than only picking it up
 * on next load.
 *
 * Defaults to `false` (motion allowed) in environments without
 * `matchMedia` (e.g. some test setups) rather than throwing. jsdom does not
 * implement `window.matchMedia` at all (it is `undefined`, not a stub),
 * which is why both the initial read and the effect guard for it.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getInitialValue)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const mql = window.matchMedia(QUERY)
    const onChange = () => setReduced(mql.matches)

    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
