import { createContext, useContext } from 'react'
import type { FitClaim } from '@/lib/fitClaim'

/**
 * The claim a `Section`'s own `FitRegion`(s) contend for (`src/lib/
 * fitClaim.ts`). `Section` provides one instance per section; `FitRegion`
 * reads it via `useSectionFitClaim`.
 *
 * Split out of `Section.tsx` itself so that file can stay component-only
 * (react-refresh's fast-refresh lint rule requires files that export a
 * component to export nothing else).
 */
export const SectionFitContext = createContext<FitClaim | null>(null)

/**
 * Throws when called outside a `<Section>` -- there is nothing sensible
 * for a fit region to measure against without one (`useFitToViewport` fits
 * an element to its *owning section's* rendered height), so `FitRegion`
 * uses this to make "attach fit behaviour outside a section" a
 * build-time-visible mistake instead of a silently-broken runtime no-op.
 */
export function useSectionFitClaim(): FitClaim {
  const claim = useContext(SectionFitContext)
  if (!claim) {
    throw new Error('<FitRegion> must be rendered inside a <Section>; there is no section for it to fit to.')
  }
  return claim
}
