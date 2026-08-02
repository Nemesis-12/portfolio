import { Section } from '@/components/layout/Section'
import { EDUCATION_COLUMN, EXPERIENCE_COLUMN, type TimelineColumn } from '@/data/timeline'
import { sections } from '@/data/sections'
import { cn } from '@/lib/cn'

const meta = sections[4]

/**
 * Timeline section (issue #320): education and experience side by side, so
 * a visitor sees the whole trajectory at once. Above the 880px breakpoint
 * the two columns sit in a two-column grid within one viewport; below it
 * they stack into a single column (`grid-cols-1 lg:grid-cols-2`), same
 * pattern the layout system already uses elsewhere.
 *
 * All copy and dates live in `src/data/timeline.ts` -- every figure there
 * is sourced from `public/resume.pdf`. This component is pure
 * presentation: no dates, titles, or bullets are written here.
 */
export function EducationExperience() {
  return (
    <Section id={meta.id} label={meta.label}>
      <div className="flex h-full flex-col gap-[var(--space-sm)]">
        <div className="flex items-baseline gap-[var(--space-sm)] flex-wrap">
          <p className="font-mono text-fluid-xs tracking-[0.2em] text-dim">{meta.eyebrow}</p>
          <h2 className="font-display text-fluid-2xl leading-tight text-fg">{meta.title}</h2>
          <span className="h-px flex-1 min-w-[2rem] bg-line" aria-hidden="true" />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-[var(--space-xs)] lg:grid-cols-2">
          <TimelineColumnPanel column={EDUCATION_COLUMN} />
          <TimelineColumnPanel column={EXPERIENCE_COLUMN} />
        </div>
      </div>
    </Section>
  )
}

function TimelineColumnPanel({ column }: { column: TimelineColumn }) {
  return (
    <div className="flex flex-col gap-[var(--space-2xs)]">
      <div className="flex items-center gap-[var(--space-2xs)] border border-line-2 bg-panel-2 px-[var(--space-sm)] py-[var(--space-2xs)]">
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
              'flex flex-1 flex-col gap-[var(--space-3xs)] border bg-panel px-[var(--space-sm)] py-[var(--space-xs)]',
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

            <h4 className="font-display text-fluid-xs leading-snug text-fg">{entry.title}</h4>
            <p className="text-fluid-sm text-dim">{entry.qualifier}</p>

            <ul className="flex flex-col gap-[var(--space-3xs)] border-t border-line pt-[var(--space-2xs)] text-fluid-sm text-fg-2">
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
