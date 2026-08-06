import { useEffect, useRef } from 'react'
import type { SectionFitContextValue } from '@/components/layout/sectionFitContext'
import { zoomFitStrategy, type FitStrategy } from '@/lib/fitStrategy'
import { PANEL_QUERY, queryMatches, subscribeToMediaQuery } from '@/lib/useMediaQuery'

/**
 * Reproduces the design reference's `[data-fit]` shrink-to-fit mechanism.
 *
 * The reference's own height-aware `clamp(...vh...)` scale (see the "fit"
 * tokens in `src/styles/layout.css`) is the primary defence against a
 * section growing past one viewport tall, but the reference does not rely
 * on that alone -- every `data-fit` element also gets a runtime pass that
 * measures its owning section against `window.innerHeight` and, if it
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
 * directly. It requires a `SectionFitContextValue` (`src/components/
 * layout/sectionFitContext.ts`), which carries both the owning section's
 * element (what actually gets measured -- no `closest('section')` DOM
 * crawl needed) and proof that this section has agreed to host exactly
 * one fit region. The only sanctioned way to obtain one is `Section`'s own
 * context, so a caller reaching for this hook still has to go through
 * `FitRegion` (or explicitly work around that contract) rather than being
 * able to attach fit behaviour to an arbitrary element with no owning
 * section.
 */
export function useFitToViewport<T extends HTMLElement>(
  sectionFit: SectionFitContextValue,
  strategy: FitStrategy = zoomFitStrategy,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    if (!sectionFit.claimFit()) {
      // Deliberately surfaced: two fit regions in one section would otherwise silently compound their zoom.
      console.error(
        '[useFitToViewport] Another fit region is already active in this section; nesting two is not supported. This region will not shrink to fit.',
      )
      return
    }

    const fit = () => {
      strategy.reset(el)
      const section = sectionFit.sectionRef.current
      if (!section || !queryMatches(PANEL_QUERY)) return

      const outcome = strategy.run(el, section)
      if (!outcome.fitted) {
        // Deliberately surfaced: previously this case was silent (the section is left overflowing the viewport with no signal anywhere).
        console.warn(
          `[useFitToViewport] Gave up shrinking a section to fit the viewport: still ${Math.round(outcome.overflowPx)}px too tall at the ${outcome.floor}x floor.`,
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
      sectionFit.releaseFit()
    }
  }, [sectionFit, strategy])

  return ref
}
