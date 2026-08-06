/**
 * Guards against two `FitRegion`s (`src/components/layout/FitRegion.tsx`)
 * being active inside the same section at once.
 *
 * `useFitToViewport` drives a section's shrink-to-fit correction by writing
 * a CSS `zoom` onto its element -- `zoom` compounds with any other `zoom`
 * already in effect on a descendant, so two fitted regions sharing one
 * `<section>` would silently double-correct each other rather than
 * independently reaching a sane size. A single `<section>` genuinely only
 * ever needs one such region (the whole point is "shrink THIS section to
 * fit one screen"), so this is a claim, not a counter: the first region to
 * mount inside a given `Section` holds it, and any further one that tries
 * to mount there is refused rather than silently compounding.
 *
 * Deliberately plain (no React import) so it is fully unit-testable without
 * a DOM.
 */
export interface FitClaim {
  /** Attempts to take the claim. Returns `true` if it succeeded (no other holder), `false` if it was already held. */
  claim(): boolean
  /** Releases the claim. Safe to call even if this caller never held it. */
  release(): void
  /** Whether the claim is currently held by anyone. */
  readonly isHeld: boolean
}

export function createFitClaim(): FitClaim {
  let held = false
  return {
    claim() {
      if (held) return false
      held = true
      return true
    },
    release() {
      held = false
    },
    get isHeld() {
      return held
    },
  }
}
