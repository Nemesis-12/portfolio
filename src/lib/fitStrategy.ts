/**
 * The design reference's `[data-fit]` shrink-to-fit mechanism (see
 * `useFitToViewport.ts`'s header comment for the full history): shrink an
 * element via CSS `zoom` until its owning section fits `window.innerHeight`,
 * floor at 0.6x, give up after 3 correction passes.
 *
 * There is exactly one implementation of this today (`zoomFitStrategy`),
 * and it owns the *whole* pass loop -- not just the per-pass math -- so
 * the hook that drives it never has to know a CSS property name, a floor
 * value, or a pass count. It hands over the element and its section and
 * gets back whether the section ended up fitting.
 */

/** One pass's measurements, gathered from the live DOM by `zoomFitStrategy.run`. */
export interface FitPassInput {
  /** How many px the owning section's rendered height exceeds `window.innerHeight` by. Non-positive means it already fits. */
  overflowPx: number
  /** The fitted element's own rendered height for this pass. */
  elementHeightPx: number
  /** The scale already applied from the previous pass (1 = unscaled). */
  currentScale: number
}

/** A proposed correction: the new scale, and the CSS declaration that applies it. */
export interface FitCorrection {
  scale: number
  cssValue: string
}

/** The result of running a strategy's full pass loop against an element. */
export type FitOutcome =
  | { fitted: true }
  | {
      fitted: false
      /** How many px of overflow remained when the strategy gave up. */
      overflowPx: number
      /** The floor scale the strategy stopped at. */
      floor: number
    }

export interface FitStrategy {
  /** Resets any correction previously applied to `el`, before a fresh measurement pass. */
  reset(el: HTMLElement): void
  /** Measures and corrects `el` against how far `section` overflows `window.innerHeight`, returning whether it ended up fitting. */
  run(el: HTMLElement, section: HTMLElement): FitOutcome
}

/** The smallest scale `zoomFitStrategy` will ever propose. */
export const FLOOR = 0.6

const MAX_PASSES = 3

/**
 * The pure per-pass correction math, factored out of the DOM-touching loop
 * so it stays unit-testable without a real layout engine -- jsdom has none
 * (`getBoundingClientRect` always reports 0 there), so this is the only
 * part of the mechanism that CAN be exercised outside a real browser.
 */
export function nextZoomCorrection({ overflowPx, elementHeightPx, currentScale }: FitPassInput): FitCorrection | null {
  if (overflowPx <= 1) return null
  if (elementHeightPx <= 0) return null
  const scale = Math.max(FLOOR, currentScale * Math.max(FLOOR, (elementHeightPx - overflowPx) / elementHeightPx))
  return { scale, cssValue: String(scale) }
}

/**
 * Whether a finished fit pass should be surfaced to a developer as a "gave
 * up, content still overflows" case rather than silently leaving the
 * section too tall for the viewport. True once the floor has been reached
 * and real overflow still remains.
 */
export function isResidualOverflow(finalOverflowPx: number, finalScale: number): boolean {
  return finalOverflowPx > 1 && finalScale <= FLOOR
}

export const zoomFitStrategy: FitStrategy = {
  reset(el) {
    el.style.setProperty('zoom', '1')
  },
  run(el, section) {
    let scale = 1
    let overflowPx = 0
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      overflowPx = section.getBoundingClientRect().height - window.innerHeight
      const elementHeightPx = el.getBoundingClientRect().height
      const correction = nextZoomCorrection({ overflowPx, elementHeightPx, currentScale: scale })
      if (!correction) break
      scale = correction.scale
      el.style.setProperty('zoom', correction.cssValue)
    }

    if (isResidualOverflow(overflowPx, scale)) {
      return { fitted: false, overflowPx, floor: FLOOR }
    }
    return { fitted: true }
  },
}
