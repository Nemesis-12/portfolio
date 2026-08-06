import type { ComponentPropsWithoutRef } from 'react'
import { useSectionFit } from '@/components/layout/sectionFitContext'
import type { FitStrategy } from '@/lib/fitStrategy'
import { useFitToViewport } from '@/lib/useFitToViewport'

interface FitRegionProps extends Omit<ComponentPropsWithoutRef<'div'>, 'ref'> {
  /**
   * Swaps the correction math `useFitToViewport` runs (`src/lib/
   * fitStrategy.ts`). Defaults to the reference's own CSS-`zoom` mechanism;
   * exists so a different fitting approach can be tried per-region without
   * touching the section that renders it.
   */
  strategy?: FitStrategy
}

/**
 * The one place the four sections that need to shrink to fit one viewport
 * (`EducationExperience`, `ProjectsOther`, `ProjectsFeatured`,
 * `SkillsGraph`) get that behaviour, instead of each repeating the same
 * `ref`/`data-fit` wiring around `useFitToViewport` directly (#356).
 *
 * Two invariants that used to live only in a comment are now structural:
 *
 * - **Must be inside a `<Section>`.** `useSectionFit()` throws immediately
 *   if there is no enclosing `Section` -- there is nothing for the hook to
 *   measure against otherwise, so this used to fail silently (the hook's
 *   own `el.closest('section')` check would just find nothing and no-op
 *   forever). Now it fails loudly, at the source, and the hook is handed
 *   the section element directly rather than rediscovering it.
 * - **At most one per section.** `Section` hands out a single fit claim
 *   to its subtree; the first `FitRegion` to mount claims it, and any
 *   further one in the same section is refused rather than silently
 *   compounding its `zoom` with the first's (`src/components/layout/
 *   sectionFitContext.ts`, `useFitToViewport.ts`). The refused region logs
 *   a `console.error` and simply does not shrink, instead of the two
 *   fighting invisibly.
 *
 * `data-fit=""` is applied uniformly here, matching the design reference's
 * own attribute on these elements -- previously two of the four call sites
 * carried it and two didn't, an inconsistency with no behavioural effect
 * (nothing in `src/styles/*.css` selects on `[data-fit]`) but worth fixing
 * now that the markup lives in one place.
 */
export function FitRegion({ strategy, children, ...rest }: FitRegionProps) {
  const sectionFit = useSectionFit()
  const fitRef = useFitToViewport<HTMLDivElement>(sectionFit, strategy)

  return (
    <div ref={fitRef} data-fit="" {...rest}>
      {children}
    </div>
  )
}
