import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function readPreference(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

/**
 * Whether the visitor has asked for reduced motion. Read live (not cached
 * at module scope) and kept in sync if the OS-level setting changes while
 * the page is open.
 *
 * This is the one thing the hero's board and tagline check before
 * starting any timer at all -- per the spec, reduced motion is handled by
 * not animating in the first place, not by zeroing CSS durations after
 * the fact.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(readPreference)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(QUERY)
    const onChange = () => setReduced(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}
