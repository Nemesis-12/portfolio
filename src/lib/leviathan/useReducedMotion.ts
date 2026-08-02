import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function readPreference(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

/**
 * Whether the visitor has requested reduced motion, used by both the
 * inference-pipeline widget and its headline-stat counters (issue #317).
 *
 * jsdom does not implement `window.matchMedia` at all (it is `undefined`,
 * not a stub) — `readPreference` guards for that and falls back to `false`
 * rather than throwing at render or import time.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readPreference)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia(QUERY)
    const onChange = () => setReduced(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
