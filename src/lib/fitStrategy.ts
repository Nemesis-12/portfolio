/**
 * The correction math `useFitToViewport` runs each pass, factored out as a
 * swappable, DOM-free `FitStrategy` so the shrink-to-fit *mechanism* (CSS
 * `zoom`, a 0.6 floor, up to 3 passes) is one interchangeable implementation
 * of the hook's contract ("given how far the section overflows, propose a
 * smaller scale") rather than baked into the hook itself.
 */

/** One pass's measurements, gathered from the live DOM by the caller. */
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

export interface FitStrategy {
  /** CSS property this strategy drives (e.g. `'zoom'`). */
  readonly cssProperty: string
  /** Value that neutralises the property, applied before each measurement pass and on cleanup. */
  readonly resetValue: string
  /** The smallest scale this strategy will ever propose. */
  readonly floor: number
  /** Maximum correction passes attempted before giving up. */
  readonly maxPasses: number
  /** Proposes the next correction, or `null` if no further correction should be attempted (already fits, or nothing more to try). */
  nextCorrection(input: FitPassInput): FitCorrection | null
}

const FLOOR = 0.6

/**
 * Direct port of the design reference's own runtime behaviour (see
 * `useFitToViewport.ts`'s header comment for the full history): shrink via
 * CSS `zoom`, floor at 0.6x, stop once the section is within 1px of fitting
 * or the element reports no height to measure against.
 */
export const zoomFitStrategy: FitStrategy = {
  cssProperty: 'zoom',
  resetValue: '1',
  floor: FLOOR,
  maxPasses: 3,
  nextCorrection({ overflowPx, elementHeightPx, currentScale }) {
    if (overflowPx <= 1) return null
    if (elementHeightPx <= 0) return null
    const scale = Math.max(FLOOR, currentScale * Math.max(FLOOR, (elementHeightPx - overflowPx) / elementHeightPx))
    return { scale, cssValue: String(scale) }
  },
}

/**
 * Whether a finished fit pass should be surfaced to a developer as a "gave
 * up, content still overflows" case rather than silently leaving the
 * section too tall for the viewport. True once the strategy's floor has
 * been reached and real overflow still remains.
 */
export function isResidualOverflow(finalOverflowPx: number, finalScale: number, strategy: FitStrategy): boolean {
  return finalOverflowPx > 1 && finalScale <= strategy.floor
}
