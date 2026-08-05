import { useEffect, useRef } from 'react'
import { PANEL_QUERY, queryMatches, subscribeToMediaQuery } from '@/lib/useMediaQuery'

/**
 * Reproduces the design reference's `[data-fit]` shrink-to-fit mechanism.
 *
 * The reference's own height-aware `clamp(...vh...)` scale (see the "fit"
 * tokens in `src/styles/layout.css`) is the primary defence against a
 * section growing past one viewport tall, but the reference does not rely
 * on that alone -- every `data-fit` element also gets a runtime pass that
 * measures its owning `<section>` against `window.innerHeight` and, if it
 * still overflows, scales the element down via CSS `zoom` (floor 0.6x,
 * up to 3 correction passes) until it fits or the floor is hit. That is
 * the actual mechanism that guarantees the "one section, one screen"
 * promise at viewport heights too short for the clamp bounds alone to
 * cover -- this hook is a direct port of it, not a reinterpretation.
 *
 * Only runs at/above the 880px panel breakpoint (`PANEL_QUERY`), where
 * `.section-shell` fixes sections to `100dvh` in the first place. Below
 * it sections are ordinary flow content -- nothing is ever shrunk there.
 */
export function useFitToViewport<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const fit = () => {
      const section = el.closest('section')
      el.style.setProperty('zoom', '1')
      if (!section || !queryMatches(PANEL_QUERY)) return

      for (let pass = 0; pass < 3; pass++) {
        const over = section.getBoundingClientRect().height - window.innerHeight
        if (over <= 1) break
        const cur = Number.parseFloat(el.style.getPropertyValue('zoom')) || 1
        const h = el.getBoundingClientRect().height
        if (h <= 0) break
        const next = Math.max(0.6, cur * Math.max(0.6, (h - over) / h))
        el.style.setProperty('zoom', String(next))
      }
    }

    let fitTimer: ReturnType<typeof setTimeout>
    const fitSoon = () => {
      clearTimeout(fitTimer)
      fitTimer = setTimeout(fit, 120)
    }

    fit()
    const initialTimer = setTimeout(fit, 300)
    window.addEventListener('resize', fitSoon, { passive: true })
    const unsubscribe = subscribeToMediaQuery(PANEL_QUERY, fitSoon)

    let cancelled = false
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) fit()
      })
    }

    return () => {
      cancelled = true
      clearTimeout(fitTimer)
      clearTimeout(initialTimer)
      window.removeEventListener('resize', fitSoon)
      unsubscribe()
    }
  }, [])

  return ref
}
