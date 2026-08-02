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
import { useFitToViewport } from '@/lib/useFitToViewport'

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
  const fitRef = useFitToViewport<HTMLDivElement>()

  return (
    <Section id={meta.id} headingId="projects-heading">
      <p className="font-mono text-fluid-xs tracking-[0.2em] text-dim">{meta.eyebrow}</p>

      {/*
       * `mt`/`max-h` and the `zoom`-based `fitRef` reproduce the reference
       * article's own `margin-top:clamp(18px,2.6vh,28px)` and
       * `max-height:760px` on `[data-fit]` -- both only matter at/above
       * the 880px panel breakpoint, where `.section-shell` fixes the
       * section to one viewport tall in the first place.
       */}
      <div
        ref={fitRef}
        className="flex flex-1 flex-col border border-line-2 bg-panel panel:mt-[clamp(18px,2.6vh,28px)] panel:max-h-[760px] panel:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-[var(--space-fit-xs)] p-[clamp(16px,2.4vh,30px)_clamp(18px,2.2vw,30px)]">
          <div className="flex items-baseline gap-[var(--space-xs)] flex-wrap">
            <h2 id="projects-heading" className="font-display text-fit-xl leading-tight text-fg">Leviathan</h2>
            <span className="text-fit-xs tracking-[0.18em] text-dim">{LEVIATHAN_SUBTITLE}</span>
          </div>

          <p className="text-fit-lg text-accent-2">{LEVIATHAN_HOOK}</p>

          <p className="text-fit-base text-fg-2">{LEVIATHAN_SUMMARY}</p>

          <ul className="flex flex-col gap-[var(--space-fit-3xs)] text-fit-sm text-fg-2">
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
                  className="border-b border-line-2 pb-[2px] text-[12.5px] text-fg-2"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 border-line bg-panel-2 p-[clamp(14px,2.2vh,26px)_clamp(16px,2vw,26px)] panel:border-l">
          <InferencePipeline />
        </div>
      </div>
    </Section>
  )
}
