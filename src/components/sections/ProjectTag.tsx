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
 * second detector. The animation class is only ever applied to the inner
 * `label` span when `blink` is true AND the visitor has not asked for
 * reduced motion. The accent-blue label colour itself is applied whenever
 * `blink` is true, independent of reduced motion -- same as the
 * pre-boxed version this restores (`text-accent-2` unconditionally,
 * `motion-safe:[animation:...]` gating only the motion).
 *
 * The pulse itself (mochi/style-match, "i wanted the running blinking
 * animation to be similar to the study now and working now animations")
 * is the same `[animation:pulse_1.8s_ease-in-out_infinite]` shorthand the
 * Timeline's live status indicator uses (`EducationExperience.tsx`), just
 * gated through this hook instead of `motion-safe:` -- see the comment on
 * the label span below for details. `src/styles/projectTag.css`, which
 * used to hold a dedicated hard on/off `step-end` keyframe for this tag,
 * has been removed as dead code now that this reuses the shared `pulse`
 * keyframe declared in `src/index.css`.
 */
export function ProjectTag({ label, year, blink = false }: ProjectTagProps) {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <span className="shrink-0 whitespace-nowrap border border-line-2 px-2 py-[4px] text-2xs tracking-[0.18em] text-dim">
      {/*
       * Owner: "i wanted the running blinking animation to be similar to
       * the study now and working now animations" (mochi/style-match).
       * Reuses the exact `pulse` animation the Timeline's live status
       * indicator uses (`EducationExperience.tsx`, `isCurrent &&
       * 'motion-safe:[animation:pulse_1.8s_ease-in-out_infinite]'`) --
       * same keyframe (`@keyframes pulse`, src/index.css), same 1.8s
       * duration, same ease-in-out easing, same opacity range -- so the
       * two read as one motion language instead of the old hard on/off
       * `step-end` blink. Gated by `usePrefersReducedMotion` (this
       * component's existing hook) rather than switching to Tailwind's
       * `motion-safe:` variant the Timeline uses -- one reduced-motion
       * mechanism per consumer, both already coexisted before this
       * change. The `pulse` keyframe itself is also declared inside
       * `@media (prefers-reduced-motion: no-preference)` in
       * src/index.css, so a reduced-motion visitor gets no animation
       * defined at all here, belt-and-braces on top of the hook.
       */}
      <span className={cn(blink && 'text-accent-2', blink && !reducedMotion && '[animation:pulse_1.8s_ease-in-out_infinite]')}>
        {label}
      </span>{' '}
      · {year}
    </span>
  )
}
