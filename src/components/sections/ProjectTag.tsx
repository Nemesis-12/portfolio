import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export interface ProjectTagProps {
  /** e.g. "SHIPPED", "PUBLISHED", "RUNNING". */
  readonly label: string
  readonly year: number
  /**
   * Blinks the whole tag (the Thesis card's in-progress "RUNNING · 2026",
   * mochi/style-match task 2) -- omitted/false renders a static tag, same
   * as Leviathan's "SHIPPED · 2025" and MLA's "PUBLISHED · 2025".
   */
  readonly blink?: boolean
}

/**
 * The one boxed project-status tag every project card now shares (mochi/
 * style-match task 2): Leviathan's `SHIPPED · 2025` pill
 * (`ProjectsFeatured.tsx`, sample line 343) was previously hand-written
 * only there, with the second-screen cards each rendering their own
 * ad-hoc badge markup (MLA: bare `PUBLISHED` text; Thesis: a pulsing dot
 * + `RUNNING`, `OtherProjectCard.tsx`). Factored out so every card,
 * including a future one added purely via `OTHER_PROJECTS`
 * (`src/data/otherProjects.ts`), gets the same `LABEL · YEAR` box by
 * supplying `label`/`year`/`blink` data -- no markup change needed here
 * ever again.
 *
 * Reduced motion: uses `usePrefersReducedMotion` (`src/lib/
 * usePrefersReducedMotion.ts`), the one hook every other timed/animated
 * element in this codebase (header clock tick + cursor, hero tagline,
 * Go board, inference pipeline, stat counters) already shares -- not a
 * second detector. The blink class is only ever applied when `blink` is
 * true AND the visitor has not asked for reduced motion; the stylesheet
 * (`src/styles/projectTag.css`) also carries a belt-and-braces
 * `@media (prefers-reduced-motion: reduce)` override, same pattern as
 * the header clock's cursor (`src/styles/header.css`), in case the class
 * is ever applied unconditionally by a future change.
 */
export function ProjectTag({ label, year, blink = false }: ProjectTagProps) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <span
      className={cn(
        'shrink-0 whitespace-nowrap border border-line-2 px-2 py-[4px] text-2xs tracking-[0.18em] text-dim',
        blink && !reducedMotion && 'animate-project-tag-blink',
      )}
    >
      {label} · {year}
    </span>
  )
}
