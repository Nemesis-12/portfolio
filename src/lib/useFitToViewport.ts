import { useEffect, useRef } from 'react'
import type { FitClaim } from '@/lib/fitClaim'
import { isResidualOverflow, zoomFitStrategy, type FitStrategy } from '@/lib/fitStrategy'
import { PANEL_QUERY, queryMatches, subscribeToMediaQuery } from '@/lib/useMediaQuery'

/**
 * Reproduces the design reference's `[data-fit]` shrink-to-fit mechanism.
 *
 * The reference's own height-aware `clamp(...vh...)` scale (see the "fit"
 * tokens in `src/styles/layout.css`) is the primary defence against a
 * section growing past one viewport tall, but the reference does not rely
 * on that alone -- every `data-fit` element also gets a runtime pass that
 * measures its owning `<section>` against `window.innerHeight` and, if it
 * still overflows, scales the element down (via `strategy`, `zoomFitStrategy`
 * by default -- CSS `zoom`, floor 0.6x, up to 3 correction passes) until it
 * fits or the strategy gives up. That is the actual mechanism that
 * guarantees the "one section, one screen" promise at viewport heights too
 * short for the clamp bounds alone to cover.
 *
 * Only runs at/above the 880px panel breakpoint (`PANEL_QUERY`), where
 * `.section-shell` fixes sections to `100dvh` in the first place. Below
 * it sections are ordinary flow content -- nothing is ever shrunk there.
 *
 * This is the low-level primitive `FitRegion` (`src/components/layout/
 * FitRegion.tsx`) is built on -- it is not meant to be reached for
 * directly. It requires a `FitClaim` (from `src/lib/fitClaim.ts`) as proof
 * that a section has already agreed to host exactly one fit region: the
 * only sanctioned way to obtain one is `Section`'s own context, so a
 * caller reaching for this hook still has to go through `FitRegion` (or
 * explicitly work around that contract) rather than being able to attach
 * fit behaviour to an arbitrary element with no owning section.
 */
export function useFitToViewport<T extends HTMLElement>(
  claim: FitClaim,
  strategy: FitStrategy = zoomFitStrategy,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    if (!claim.claim()) {
      // Deliberately surfaced: two fit regions in one section would otherwise silently compound their zoom.
      console.error(
        '[useFitToViewport] Another fit region is already active in this section; nesting two is not supported. This region will not shrink to fit.',
      )
      return
    }

    const fit = () => {
      const section = el.closest('section')
      el.style.setProperty(strategy.cssProperty, strategy.resetValue)
      if (!section || !queryMatches(PANEL_QUERY)) return

      let scale = 1
      let overflowPx = 0
      for (let pass = 0; pass < strategy.maxPasses; pass++) {
        overflowPx = section.getBoundingClientRect().height - window.innerHeight
        const elementHeightPx = el.getBoundingClientRect().height
        const correction = strategy.nextCorrection({ overflowPx, elementHeightPx, currentScale: scale })
        if (!correction) break
        scale = correction.scale
        el.style.setProperty(strategy.cssProperty, correction.cssValue)
      }

      if (isResidualOverflow(overflowPx, scale, strategy)) {
        // Deliberately surfaced: previously this case was silent (the section is left overflowing the viewport with no signal anywhere).
        console.warn(
          `[useFitToViewport] Gave up shrinking a section to fit the viewport: still ${Math.round(overflowPx)}px too tall at the ${strategy.floor}x floor.`,
          section,
        )
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
      claim.release()
    }
  }, [claim, strategy])

  return ref
}
