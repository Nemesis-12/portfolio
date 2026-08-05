import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ProjectTag, type ProjectTagProps } from '@/components/sections/ProjectTag'

/**
 * The card structure `ProjectsFeatured.tsx` and `OtherProjectCard.tsx`
 * independently rebuilt (issue #357): the padding shell, the
 * title-with-badge row, and the stats footer. All three had already
 * drifted between the two call sites, and the same defect class -- a long
 * title colliding with its status badge -- had been patched twice, two
 * different ways (see `ProjectCardTitleRow` below for the mechanism this
 * now converges on). Three named pieces, not one monolithic wrapper: the
 * two call sites' outer elements are structurally different (a two-column
 * `display:grid` for the featured card vs. a single hoverable `<article>`
 * for the others, `ideas/Portfolio.html` lines 339 and 425/440), so only
 * the parts that were byte-for-byte the same job get pulled out. The body
 * between the title row and the footer stays fully caller-supplied --
 * this module has no opinion on what a card's middle contains.
 */

export interface ProjectCardShellProps {
  /** `article` for a standalone, hoverable card; `div` (default) when the
   * border/hover chrome lives on an ancestor instead (the featured card's
   * two-column grid owns its own border one level up). */
  readonly as?: 'div' | 'article'
  readonly className?: string
  readonly children: ReactNode
}

/**
 * Padding, column gap and flex direction every card's content column
 * shares. Padding was `clamp(16px,2.4vh,30px) clamp(18px,2.2vw,30px)` on
 * the featured card and `clamp(16px,2.4vh,28px) clamp(18px,2.2vw,28px)` on
 * the other two -- same mins, same vh/vw factors, different max only.
 * Converged on 30px, the featured card's value (`ideas/Portfolio.html`
 * line 340): the featured LEVIATHAN card is the reference's primary,
 * highest-fidelity instance, so its declaration is the source of truth
 * here, and the two smaller cards (MLA and Thesis, lines 425 and 440)
 * move to match it rather than the other way around.
 */
export function ProjectCardShell({ as: Tag = 'div', className, children }: ProjectCardShellProps) {
  return (
    <Tag
      className={cn(
        'flex min-w-0 flex-col gap-[var(--space-fit-xs)] p-[clamp(16px,2.4vh,30px)_clamp(18px,2.2vw,30px)]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export interface ProjectCardTitleRowProps {
  /** The title element itself (an `<h3>` or a plain `<span>`, whichever
   * the caller's card uses) -- this row only supplies the layout wrapper
   * around it, not its typography. */
  readonly title: ReactNode
  readonly badge: ProjectTagProps
}

/**
 * Title-with-badge row. Stacks into a column below 880px and only becomes
 * a side-by-side row at `panel:` (880px+) -- the featured card's own
 * mechanism (see the removed comment in `ProjectsFeatured.tsx`'s git
 * history), now applied to both cards rather than just one.
 *
 * The other-project cards previously used a plain, unconditional
 * `items-start justify-between` row and leaned on shrinking the title's
 * own font at narrow widths (issue #346) to keep it clear of the badge --
 * a second, different fix for the same defect class the featured card's
 * column-stack already solved generally. Column-stacking still applies
 * here regardless of title length or font size, so it, not a font-size
 * tune, is what now guarantees a long title can't collide with its badge
 * in either card; the per-card font choices (`text-fit-title` /
 * `panel:text-fluid-lg` for the smaller cards, `text-fit-xl` for the
 * featured one) are untouched and still live on each caller's own title
 * element.
 */
export function ProjectCardTitleRow({ title, badge }: ProjectCardTitleRowProps) {
  return (
    <div className="flex flex-col items-start gap-[var(--space-2xs)] panel:flex-row panel:items-start panel:justify-between panel:gap-[12px]">
      <div className="min-w-0 flex-1">{title}</div>
      <ProjectTag {...badge} />
    </div>
  )
}

export interface ProjectCardStatsFooterProps {
  /** Stat entries plus any trailing links -- rendered exactly as each
   * caller assembles them today (a `StatCounter` list and a link cluster
   * for the featured card, plain stat divs and an optional single link for
   * the others). The footer only supplies the shared row chrome. */
  readonly children: ReactNode
  /** Optional extra classes merged onto the footer's own (e.g. `mt-auto`
   * to pin the footer to the bottom of a card taller than its content --
   * see `ProjectsFeatured.tsx`). */
  readonly className?: string
}

/**
 * Stats/links footer shared by every card. Gap was a fluid
 * `clamp(16px,2.4vw,32px)` on the featured card and a hardcoded `26px` on
 * the others (`ideas/Portfolio.html` line 353 vs. lines 433/452).
 * Converged on the featured card's fluid value: same reasoning as the
 * shell padding above -- the featured card's declaration (line 353) is
 * the source of truth, and the two smaller cards' hardcoded gaps move to
 * match it.
 */
export function ProjectCardStatsFooter({ children, className }: ProjectCardStatsFooterProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-[clamp(16px,2.4vw,32px)] border-t border-line pt-[var(--space-fit-md)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
