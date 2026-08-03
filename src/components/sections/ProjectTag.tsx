import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

export interface ProjectTagProps {
  /** e.g. "SHIPPED", "PUBLISHED", "RUNNING". */
  readonly label: string
  readonly year: number
  /**
   * Blinks only the `label` text, in the accent blue it carried before it
   * was boxed (mochi/style-match audit, defect 2) -- the box itself and
   * the `· year` fragment stay static. A prior pass blinked the whole
   * boxed tag; the owner corrected that: "that is not the one that is
   * supposed to be blinking, it was the running text INSIDE the tag that
   * is supposed to be blinking... the same blue running except it's
   * inside the box." Omitted/false renders a fully static tag, same as
   * Leviathan's "SHIPPED · 2025" and MLA's "PUBLISHED · 2025".
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
 * second detector. The blink animation class is only ever applied to the
 * inner `label` span when `blink` is true AND the visitor has not asked
 * for reduced motion; the stylesheet (`src/styles/projectTag.css`) also
 * carries a belt-and-braces `@media (prefers-reduced-motion: reduce)`
 * override, same pattern as the header clock's cursor (`src/styles/
 * header.css`), in case the class is ever applied unconditionally by a
 * future change. The accent-blue label colour itself is applied whenever
 * `blink` is true, independent of reduced motion -- same as the
 * pre-boxed version this restores (`text-accent-2` unconditionally,
 * `motion-safe:[animation:...]` gating only the motion).
 */
export function ProjectTag({ label, year, blink = false }: ProjectTagProps) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <span className="shrink-0 whitespace-nowrap border border-line-2 px-2 py-[4px] text-2xs tracking-[0.18em] text-dim">
      <span className={cn(blink && 'text-accent-2', blink && !reducedMotion && 'animate-project-tag-blink')}>
        {label}
      </span>{' '}
      · {year}
    </span>
  )
}
