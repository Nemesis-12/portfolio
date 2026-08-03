import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { EDUCATION_COLUMN, EXPERIENCE_COLUMN, type TimelineColumn, type TimelineEntry } from '@/data/timeline'
import { getSectionMeta } from '@/data/sections'
import { cn } from '@/lib/cn'
import { useFitToViewport } from '@/lib/useFitToViewport'

const meta = getSectionMeta('path')

/**
 * Timeline section (issue #320, mochi/style-match): education and
 * experience as ONE hairline grid (sample lines 491-557,
 * `ideas/Portfolio.html`), not two separate flex columns.
 *
 * The grid is `grid-auto-flow:column` over a 3-row template (header,
 * entry, entry) with `gap:1px` on a `--line`-colored background -- that
 * gap-over-background is what draws the seams between cells, so it is
 * reproduced as-is rather than faked with per-cell borders (line 498).
 * `grid-auto-flow:column` fills top-to-bottom then left-to-right, so the
 * DOM order below (education header, education entry, education entry,
 * experience header, experience entry, experience entry) is what actually
 * lays the two columns out side by side above the 880px `data-pathgrid`
 * breakpoint (`src/styles/layout.css`).
 *
 * All copy and dates live in `src/data/timeline.ts` -- every figure there
 * is sourced from `public/resume.pdf`. This component is pure
 * presentation: no dates, titles, or bullets are written here.
 */
export function EducationExperience() {
  const fitRef = useFitToViewport<HTMLDivElement>()

  return (
    <Section id={meta.id} headingId="path-heading">
      <SectionHeading number={meta.number} title={meta.title} headingId="path-heading" />

      {/*
       * `data-pathgrid` is the hook `src/styles/layout.css`'s only media
       * query (sample lines 256-258) targets to release this grid back to
       * normal document flow below 880px. `data-fit` keeps the existing
       * `useFitToViewport` shrink-to-fit wired up, matching the sample's
       * own `data-fit` attribute on this same element (line 498).
       *
       * `flex-1` is reinstated (mochi/style-match audit, same call as
       * `ProjectsOther`/`ProjectsFeatured`): a prior revision dropped it,
       * reasoning `flex:1` + `max-height:720px` "inflates" this grid past
       * what the four cells need, parking the slack as dead space below
       * each cell's content since the cells are
       * `justify-content:flex-start`. A real side-by-side Chromium render
       * of the decoded sample bytes shows the sample's own grid does
       * exactly the same thing -- cells sit top-aligned inside rows sized
       * from the section's available height, not from cell content, and
       * `flex:1` is what makes the grid consume the section's free
       * vertical space (so `.section-shell`'s `justify-content:center`
       * has none left to redistribute). Dropping `flex-1` left that space
       * unconsumed, so centering split it above AND below the (heading +
       * grid) block instead -- the empty band above the heading seen in
       * real renders. `max-height` still caps the grid for unusually long
       * bullet lists.
       */}
      {/*
       * Each entry band (header aside) is split into four explicit
       * subrows -- status line, title, qualifier, hairline+bullets --
       * repeated once per entry (mochi/style-match audit, defect 3/4).
       * The sample never needs this: its own titles ("MS COMPUTER
       * SCIENCE", "SOFTWARE ENGINEER INTERN") are always one line, so a
       * plain flex column per cell coincidentally keeps every cell's
       * hairline rule at the same height for free. The résumé wording
       * used here (`src/data/timeline.ts`, "résumé is source of truth")
       * is longer -- "Accelerated Master of Science in Computer Science"
       * wraps to two lines while its row-mate "Software Engineer Intern"
       * does not -- so independent flex columns put the two cells'
       * hairline rules at different heights (verified via a real
       * Chromium render: ~20px apart at 1440x900). `TimelineEntryCell`
       * below is `grid-template-rows:subgrid` over these four shared
       * tracks (`row-span-4`), so the taller cell in a row band widens
       * the shared subrow for BOTH cells and every subsequent element --
       * qualifier, hairline, bullets -- lands on the same line across
       * the row regardless of which cell's title wrapped.
       *
       * The bullets row alone is `minmax(0,1fr)` (mochi/style-match
       * slack audit, re-opened after the owner flagged the double-spacer
       * version as smeared/justified). A real Chromium render of the
       * decoded sample bytes settles this directly: the sample's own
       * cell is `display:flex;flex-direction:column;gap:...;
       * justify-content:flex-start` (line 505) inside an outer grid row
       * that is `minmax(0,1fr)` (line 498) -- i.e. the WHOLE cell
       * stretches to fill its row band, and `flex-start` leaves every
       * gap at its plain `gap` value and dumps 100% of the leftover
       * height in exactly one place: below the last bullet. Measured at
       * 1440x900: 166px of empty space after the last bullet in every
       * cell, and the status→title, title→qualifier, qualifier→hairline
       * gaps all sitting at the plain ~10-20px `gap`/`padding` values,
       * not inflated. The double-spacer version (one `minmax(0,1fr)`
       * track before the hairline, one after) was a guess at avoiding a
       * "stranded content" look without checking what the sample
       * actually does -- the sample does exactly that "stranded" look on
       * purpose. Only the bullets row (`row-start-4` of the 4-row
       * subgrid below) is `minmax(0,1fr)`; the other three stay `auto`.
       * Row-mate pairing still holds because these are shared OUTER grid
       * tracks (one explicit row-template for the whole `data-pathgrid`,
       * not one per column) -- the taller of a row band's two titles (or
       * two bullet lists) still sets that shared track's height for both
       * cells, same mechanism as before, just without the two empty
       * spacer tracks.
       */}
      <div
        ref={fitRef}
        data-pathgrid=""
        data-fit=""
        className="mt-[var(--space-fit-margin-tight)] grid flex-1 grid-flow-col auto-cols-[minmax(0,1fr)] grid-rows-[auto_repeat(2,auto_auto_auto_minmax(0,1fr))] gap-px border border-line-2 bg-line max-h-[720px]"
      >
        <TimelineColumnCells column={EDUCATION_COLUMN} kind="education" />
        <TimelineColumnCells column={EXPERIENCE_COLUMN} kind="experience" />
      </div>
    </Section>
  )
}

function TimelineColumnCells({
  column,
  kind,
}: {
  column: TimelineColumn
  kind: 'education' | 'experience'
}) {
  const isExperience = kind === 'experience'

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap items-center gap-[13px] px-[18px] py-[clamp(11px,1.8vh,16px)]',
          isExperience ? 'bg-accent text-bg' : 'bg-fg text-bg',
        )}
      >
        <span aria-hidden="true" className="h-3 w-3 rounded-full bg-bg" />
        <span className="font-display text-[clamp(12px,1.5vw,15px)]">{column.heading}</span>
        {/*
         * Size raised from a fixed 10px to the shared `text-fit-meta`
         * token, and opacity raised from .65/.75 to .9 (mochi/style-match
         * task 3): at .65/.75 the experience column's label (near-black
         * text on the accent-blue header) measured well under WCAG AA's
         * 4.5:1 for normal text even at full opacity (the accent blue
         * itself caps this pairing around 4.3:1) -- .9 gets both columns
         * as close to that ceiling as this token pairing allows without
         * changing the theme's accent colour, which is out of scope here.
         */}
        <span className="ml-auto text-fit-meta uppercase tracking-[0.2em] opacity-90">{column.kind}</span>
      </div>

      {column.entries.map((entry) => (
        <TimelineEntryCell key={entry.id} entry={entry} kind={kind} />
      ))}
    </>
  )
}

function TimelineEntryCell({
  entry,
  kind,
}: {
  entry: TimelineEntry
  kind: 'education' | 'experience'
}) {
  const isExperience = kind === 'experience'
  const isCurrent = entry.status === 'current'

  return (
    <article className="grid row-span-4 grid-rows-subgrid gap-[var(--space-fit-2xs)] bg-panel px-[clamp(14px,1.8vw,22px)] py-[var(--space-fit-sm)]">
      {/*
       * `text-fit-meta` + `text-dim` (mochi/style-match task 3): the
       * owner's own report at 1440x900 -- the status label and date range
       * were "barely visible" at the old fixed 9.5px / `text-dim-2`
       * pairing, which measures 3.1:1 against the card background, under
       * WCAG AA's 4.5:1 floor for normal text. `text-dim` alone measures
       * 5.7:1 (passes); the size bump (raised token, not a scattered
       * literal) covers the rest.
       */}
      <div className="flex flex-wrap items-center gap-[12px] text-fit-meta uppercase tracking-[0.18em] text-dim">
        <span
          className={cn(
            'flex items-center gap-[12px]',
            isCurrent && 'motion-safe:[animation:pulse_1.8s_ease-in-out_infinite]',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'h-[9px] w-[9px] rounded-full border',
              isCurrent
                ? isExperience
                  ? 'border-accent bg-accent'
                  : 'border-fg bg-fg'
                : isExperience
                  ? 'border-accent bg-transparent'
                  : 'border-fg bg-transparent',
            )}
          />
          <span className={isCurrent ? (isExperience ? 'text-accent-2' : 'text-fg') : undefined}>
            {entry.statusLabel}
          </span>
        </span>
        <span className="ml-auto">{entry.dateRange}</span>
      </div>

      <div className="font-display text-fit-title leading-[1.45] text-fg">{entry.title}</div>
      <div className="text-fit-xs text-dim">{entry.qualifier}</div>

      {/*
       * Bullets are the entry's primary content -- the qualifier line
       * above (`text-fit-xs`, `text-dim`) is secondary. Before this pass
       * the two read almost identically (bullets: 11.5-13px `text-fg-2`;
       * qualifier: 11-12.5px `text-dim`) despite bullets technically
       * measuring larger, and the owner reported the bullets "seem
       * smaller than the qualifier" (mochi/style-match task 3). Diagnosed
       * via a real render (`text-fg-2` on `text-dim` already gives
       * bullets MORE contrast, so contrast wasn't the cause): the
       * `+`-marker's own strong colour (`text-accent`/`text-fg`, the same
       * saturated colours used for status dots and titles elsewhere in
       * this card) was pulling the eye to the marker glyph rather than
       * the bullet text next to it, and the two type ranges were close
       * enough in practice (13px vs. 12.5px at typical viewport heights)
       * that the size difference alone couldn't win against that pull.
       * Fixed on both ends: `text-fit-sm` is raised (12.5-15px, shared
       * token, see `src/styles/layout.css`) so bullets measure clearly
       * larger, not marginally so, and the marker drops to `text-dim` --
       * quiet enough to read as a list marker instead of competing with
       * the (now brighter, larger) bullet text for attention.
       */}
      <div className="flex flex-col gap-[var(--space-fit-3xs-tight)] border-t border-line pt-[clamp(8px,1.4vh,12px)] text-fit-sm leading-[1.6] text-fg-2">
        {entry.bullets.map((bullet) => (
          <div key={bullet} className="flex gap-[11px]">
            <span aria-hidden="true" className="text-dim">
              +
            </span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
