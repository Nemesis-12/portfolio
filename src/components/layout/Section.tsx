import { useState, type ReactNode } from 'react'
import { SectionFitContext } from '@/components/layout/sectionFitContext'
import { cn } from '@/lib/cn'
import { createFitClaim } from '@/lib/fitClaim'

interface SectionProps {
  id: string
  /**
   * DOM id of this section's own visible heading (an `<h1>`/`<h2>` element
   * rendered somewhere inside `children`). Used as `aria-labelledby` so the
   * landmark's accessible name is sourced from that real, visible heading
   * rather than restated separately -- see the note below.
   */
  headingId: string
  children: ReactNode
  className?: string
}

/**
 * Shared shell for the six top-level sections.
 *
 * Layout/fit mechanics (`.section-shell`, the 880px breakpoint, scroll-snap
 * on `:root`, the runtime shrink-to-fit pass) belong to `src/styles/
 * layout.css` and `src/lib/useFitToViewport.ts` -- see those files for the
 * full mechanism.
 *
 * `aria-labelledby` (not `aria-label`) sources the landmark's accessible
 * name from the section's own visible heading. Every section renders
 * exactly one top-level heading already; pointing the landmark at it
 * (via `headingId`) means there is exactly one place the name is written,
 * instead of a separate `aria-label` string that has to be kept in sync
 * with a heading assistive tech users can already see and hear.
 *
 * Also provides the `FitClaim` (`src/lib/fitClaim.ts`) its subtree's
 * `FitRegion`(s) (`FitRegion.tsx`) contend for -- one instance per
 * `Section`, stable for its whole lifetime, so at most one `FitRegion`
 * inside it can ever be active at a time (#356).
 */
export function Section({ id, headingId, children, className }: SectionProps) {
  const [fitClaim] = useState(createFitClaim)

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn('section-shell', className)}
    >
      <SectionFitContext.Provider value={fitClaim}>{children}</SectionFitContext.Provider>
    </section>
  )
}
