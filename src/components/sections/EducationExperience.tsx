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
      <div
        ref={fitRef}
        data-pathgrid=""
        data-fit=""
        className="mt-[var(--space-fit-margin-tight)] grid flex-1 grid-flow-col auto-cols-[minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-px border border-line-2 bg-line max-h-[720px]"
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
        <span
          className={cn(
            'ml-auto text-[10px] uppercase tracking-[0.2em]',
            isExperience ? 'opacity-75' : 'opacity-65',
          )}
        >
          {column.kind}
        </span>
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
    <article className="flex flex-col justify-start gap-[var(--space-fit-2xs)] bg-panel px-[clamp(14px,1.8vw,22px)] py-[var(--space-fit-sm)]">
      <div className="flex flex-wrap items-center gap-[12px] text-[9.5px] uppercase tracking-[0.18em] text-dim-2">
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

      <div className="flex flex-col gap-[var(--space-fit-3xs-tight)] border-t border-line pt-[clamp(8px,1.4vh,12px)] text-[clamp(11.5px,1.45vh,13px)] leading-[1.6] text-fg-2">
        {entry.bullets.map((bullet) => (
          <div key={bullet} className="flex gap-[11px]">
            <span aria-hidden="true" className={isExperience ? 'text-accent' : 'text-fg'}>
              +
            </span>
            <span>{bullet}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
