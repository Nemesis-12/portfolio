import { Section } from '@/components/layout/Section'
import { EDUCATION_COLUMN, EXPERIENCE_COLUMN, type TimelineColumn } from '@/data/timeline'
import { getSectionMeta } from '@/data/sections'
import { cn } from '@/lib/cn'
import { useFitToViewport } from '@/lib/useFitToViewport'

const meta = getSectionMeta('path')

/**
 * Timeline section (issue #320): education and experience side by side, so
 * a visitor sees the whole trajectory at once. Above the 880px breakpoint
 * the two columns sit in a two-column grid within one viewport; below it
 * they stack into a single column (`grid-cols-1 panel:grid-cols-2`, where
 * `panel:` is the 880px breakpoint defined in `src/index.css` -- not
 * Tailwind's default `lg:`, which is 1024px and would disagree with the
 * layout shell's own 880px switch), same pattern the layout system already
 * uses elsewhere.
 *
 * All copy and dates live in `src/data/timeline.ts` -- every figure there
 * is sourced from `public/resume.pdf`. This component is pure
 * presentation: no dates, titles, or bullets are written here.
 */
export function EducationExperience() {
  const fitRef = useFitToViewport<HTMLDivElement>()

  return (
    <Section id={meta.id} headingId="path-heading">
      <div className="flex items-baseline gap-[var(--space-sm)] flex-wrap">
        <p className="font-mono text-fluid-xs tracking-[0.2em] text-dim">{meta.eyebrow}</p>
        <h2 id="path-heading" className="font-display text-fluid-2xl leading-tight text-fg">{meta.title}</h2>
        <span className="h-px flex-1 min-w-[2rem] bg-line" aria-hidden="true" />
      </div>

      {/*
       * Matches the reference `data-pathgrid` `[data-fit]` element's own
       * `margin-top:clamp(16px,2.4vh,26px)` and `max-height:720px`, plus
       * the `zoom` shrink-to-fit safety net -- both only active at/above
       * the 880px panel breakpoint, where the two columns also go
       * side-by-side (`panel:grid-cols-2`).
       */}
      <div
        ref={fitRef}
        className="grid flex-1 grid-cols-1 gap-[var(--space-xs)] panel:mt-[clamp(16px,2.4vh,26px)] panel:max-h-[720px] panel:grid-cols-2"
      >
        <TimelineColumnPanel column={EDUCATION_COLUMN} />
        <TimelineColumnPanel column={EXPERIENCE_COLUMN} />
      </div>
    </Section>
  )
}

function TimelineColumnPanel({ column }: { column: TimelineColumn }) {
  return (
    <div className="flex flex-col gap-[var(--space-2xs)]">
      <div className="flex items-center gap-[var(--space-2xs)] border border-line-2 bg-panel-2 px-[18px] py-[clamp(11px,1.8vh,16px)]">
        <h3 className="font-display text-fluid-sm leading-tight text-fg">{column.heading}</h3>
        <span className="ml-auto text-2xs tracking-[0.2em] text-dim">
          {column.kind.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-[var(--space-2xs)]">
        {column.entries.map((entry) => (
          <article
            key={entry.id}
            className={cn(
              'flex flex-1 flex-col gap-[var(--space-fit-2xs)] border bg-panel px-[clamp(14px,1.8vw,22px)] py-[var(--space-fit-sm)]',
              entry.status === 'current' ? 'border-accent' : 'border-line-2',
            )}
          >
            <div className="flex flex-wrap items-center gap-[var(--space-2xs)] text-2xs tracking-[0.18em]">
              <span
                aria-hidden="true"
                className={cn(
                  'inline-block h-[9px] w-[9px] rounded-full border',
                  entry.status === 'current'
                    ? 'border-accent bg-accent'
                    : 'border-dim-3 bg-transparent',
                )}
              />
              <span className={entry.status === 'current' ? 'text-accent-2' : 'text-dim'}>
                {entry.statusLabel}
              </span>
              <span className="ml-auto text-dim">{entry.dateRange}</span>
            </div>

            <h4 className="font-display text-fit-title leading-snug text-fg">{entry.title}</h4>
            <p className="text-fit-xs text-dim">{entry.qualifier}</p>

            <ul className="flex flex-col gap-[var(--space-fit-3xs-tight)] border-t border-line pt-[var(--space-fit-2xs)] text-fit-sm text-fg-2">
              {entry.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-[var(--space-2xs)]">
                  <span
                    aria-hidden="true"
                    className={entry.status === 'current' ? 'text-accent' : 'text-fg'}
                  >
                    +
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
