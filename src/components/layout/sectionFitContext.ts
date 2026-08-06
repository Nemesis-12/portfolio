import { createContext, useContext, type RefObject } from 'react'

/**
 * What a `Section` hands to its subtree's `FitRegion`(s): the actual
 * `<section>` element to measure and shrink against, plus contention for
 * the one fit-region slot a section allows.
 *
 * `Section` provides one instance per section, stable for its whole
 * lifetime; `FitRegion` reads it via `useSectionFit`. Carrying the section
 * element itself (rather than an opaque token) means `useFitToViewport`
 * measures the exact section it was given -- it never has to rediscover
 * its owning section by crawling the DOM.
 *
 * Split out of `Section.tsx` itself so that file can stay component-only
 * (react-refresh's fast-refresh lint rule requires files that export a
 * component to export nothing else).
 */
export interface SectionFitContextValue {
  /** The `<section>` element `useFitToViewport` measures and shrinks against. */
  readonly sectionRef: RefObject<HTMLElement | null>
  /** Attempts to claim this section's single fit-region slot. Returns `true` if this caller now holds it, `false` if it was already held. */
  claimFit(): boolean
  /** Releases the claim. Safe to call even if this caller never held it. */
  releaseFit(): void
}

export const SectionFitContext = createContext<SectionFitContextValue | null>(null)

/**
 * Throws when called outside a `<Section>` -- there is nothing sensible
 * for a fit region to measure against without one (`useFitToViewport` fits
 * an element to its *owning section's* rendered height), so `FitRegion`
 * uses this to make "attach fit behaviour outside a section" a
 * build-time-visible mistake instead of a silently-broken runtime no-op.
 */
export function useSectionFit(): SectionFitContextValue {
  const value = useContext(SectionFitContext)
  if (!value) {
    throw new Error('<FitRegion> must be rendered inside a <Section>; there is no section for it to fit to.')
  }
  return value
}

/**
 * Contention logic for a section's one fit-region slot, factored out as a
 * plain closure (no React, no DOM) so it stays unit-testable on its own.
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
 */
export function createFitClaimant(): { claimFit(): boolean; releaseFit(): void } {
  let claimed = false
  return {
    claimFit() {
      if (claimed) return false
      claimed = true
      return true
    },
    releaseFit() {
      claimed = false
    },
  }
}
