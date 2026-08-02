import { Section } from '@/components/layout/Section'
import { InferencePipeline } from '@/components/sections/leviathan/InferencePipeline'
import { StatCounter } from '@/components/sections/leviathan/StatCounter'
import {
  LEVIATHAN_BULLETS,
  LEVIATHAN_HOOK,
  LEVIATHAN_LINKS,
  LEVIATHAN_STATS,
  LEVIATHAN_SUBTITLE,
  LEVIATHAN_SUMMARY,
} from '@/data/leviathan'
import { getSectionMeta } from '@/data/sections'

const meta = getSectionMeta('projects')

/**
 * Featured project: Leviathan gets a full screen to itself (issue #317),
 * so the strongest work is not diluted by the second projects screen
 * (#318). A visitor reads the one-line hook before any detail, then three
 * bullets covering the memory, tokenizer, and training decisions, then the
 * headline stats and links, alongside the looping inference-pipeline
 * panel that is the visual argument for "it never searches."
 *
 * All copy and figures live in `src/data/leviathan.ts` -- every factual
 * figure there is sourced from `public/resume.pdf`. This component is pure
 * presentation. The two animated pieces (`StatCounter`, `InferencePipeline`)
 * each own their own state/timer/observer, scoped to themselves, so this
 * section itself never re-renders on a frame tick or a count-up tick.
 */
export function ProjectsFeatured() {
  return (
    <Section id={meta.id} headingId="projects-heading">
      <div className="flex h-full flex-col gap-[var(--space-md)] panel:flex-row">
        <div className="flex flex-1 flex-col gap-[var(--space-sm)]">
          <p className="font-mono text-fluid-xs tracking-[0.2em] text-dim">{meta.eyebrow}</p>

          <div className="flex items-baseline gap-[var(--space-xs)] flex-wrap">
            <h2 id="projects-heading" className="font-display text-fluid-2xl leading-tight text-fg">Leviathan</h2>
            <span className="text-2xs tracking-[0.18em] text-dim">{LEVIATHAN_SUBTITLE}</span>
          </div>

          <p className="text-fluid-lg text-accent-2">{LEVIATHAN_HOOK}</p>

          <p className="text-fluid-base text-fg-2">{LEVIATHAN_SUMMARY}</p>

          <ul className="flex flex-col gap-[var(--space-2xs)] text-fluid-sm text-fg-2">
            {LEVIATHAN_BULLETS.map((bullet) => (
              <li key={bullet} className="flex gap-[var(--space-2xs)]">
                <span aria-hidden="true" className="text-accent">
                  →
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-end gap-[var(--space-md)] border-t border-line pt-[var(--space-xs)]">
            {LEVIATHAN_STATS.map((stat) => (
              <StatCounter key={stat.id} stat={stat} />
            ))}

            <div className="ml-auto flex gap-[var(--space-sm)]">
              {LEVIATHAN_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="border-b border-line-2 pb-[2px] text-fluid-sm text-fg-2"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 border-line bg-panel-2 p-[var(--space-sm)] panel:border-l">
          <InferencePipeline />
        </div>
      </div>
    </Section>
  )
}
