import { useRef, useState, type ReactNode } from 'react'
import { createFitClaimant, SectionFitContext, type SectionFitContextValue } from '@/components/layout/sectionFitContext'
import { cn } from '@/lib/cn'

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
 * Fit is achieved purely by CSS (`.section-shell` in `src/styles/
 * layout.css`, driven by the fluid type scale documented there) -- there
 * is no JavaScript measuring or `zoom` fallback. Above 880px each section
 * is exactly one viewport tall and snaps; below 880px the fixed height
 * and snap both release and the section is ordinary flow content. The
 * scroll-snap-type/scroll-behavior that drive snapping live on `:root`
 * (the actual document scroll container), not on this class.
 *
 * `aria-labelledby` (not `aria-label`) sources the landmark's accessible
 * name from the section's own visible heading. Every section renders
 * exactly one top-level heading already; pointing the landmark at it
 * (via `headingId`) means there is exactly one place the name is written,
 * instead of a separate `aria-label` string that has to be kept in sync
 * with a heading assistive tech users can already see and hear.
 *
 * Also provides the `SectionFitContextValue` (`sectionFitContext.ts`) its
 * subtree's `FitRegion`(s) (`FitRegion.tsx`) read: a ref to this section's
 * own DOM element (what `useFitToViewport` actually measures and shrinks
 * against) plus the claim its `FitRegion`(s) contend for -- one instance
 * per `Section`, stable for its whole lifetime, so at most one `FitRegion`
 * inside it can ever be active at a time (#356).
 */
export function Section({ id, headingId, children, className }: SectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [fitContext] = useState<SectionFitContextValue>(() => ({
    sectionRef,
    ...createFitClaimant(),
  }))

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-labelledby={headingId}
      className={cn('section-shell', className)}
    >
      <SectionFitContext.Provider value={fitContext}>{children}</SectionFitContext.Provider>
    </section>
  )
}
