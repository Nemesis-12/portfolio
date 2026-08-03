import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { InferencePipeline } from '@/components/sections/leviathan/InferencePipeline'
import { StatCounter } from '@/components/sections/leviathan/StatCounter'
import {
  LEVIATHAN_BADGE,
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
 *
 * Heading row and outer article are ported verbatim from the sample
 * (`ideas/Portfolio.html` lines 332-361, mochi/style-match audit): the
 * heading row now goes through the shared `SectionHeading` (lines
 * 332-337 -- "01" / "PROJECTS" / "FEATURED"), which owns the section's
 * one real `<h2>` (`headingId="projects-heading"`). "Leviathan" itself is
 * a plain span next to its badge, same as the sample (line 342) -- it is
 * the featured project's name, not the section's heading. The article is
 * an `auto-fit` CSS grid, not a flex row -- `minmax(340px,1fr)` alone is
 * what collapses it to a single column at narrow widths, same as the
 * sample, with no `panel:` breakpoint switch needed for the columns
 * themselves.
 */
export function ProjectsFeatured() {
  const fitRef = useFitToViewport<HTMLDivElement>()

  return (
    <Section id={meta.id} headingId="projects-heading">
      <SectionHeading
        number={meta.number}
        title={meta.title}
        headingId="projects-heading"
        label={meta.label2}
      />

      {/*
       * `mt`/`max-h` reproduce the reference article's own
       * `margin-top:clamp(18px,2.6vh,28px)` (`--space-fit-margin`,
       * `src/styles/layout.css`) and `max-height:760px` on `[data-fit]`,
       * gated to the 880px `panel:` breakpoint where `.section-shell` fixes
       * the section to one viewport tall in the first place -- below it the
       * article is ordinary flow content and nothing needs to be capped.
       * `grid-cols-[repeat(auto-fit,...)]` itself is NOT gated: it is the
       * sample's own unconditional grid (line 339), and `minmax(340px,1fr)`
       * alone collapses it to one column once two 340px panes no longer fit
       * side by side.
       *
       * `flex-1` is reinstated (mochi/style-match audit, same call as
       * `ProjectsOther`/`EducationExperience` -- see those components for
       * the shared reasoning): a prior revision dropped it, reasoning the
       * sample's own `flex:1` + `max-height:760px` combo "inflates" this
       * article past its content. A real side-by-side Chromium render of
       * the decoded sample bytes disproves that -- the sample's article
       * fills flush from the heading row's padding-top down to the
       * section's padding-bottom with zero extra slack on either edge
       * (`flex:1` consumes the free space `.section-shell`'s
       * `justify-content:center` would otherwise split above AND below
       * the whole block). Dropping `flex-1` left nothing to consume that
       * free space, so centering split it evenly around the (heading +
       * article) block instead -- the empty band above the heading seen
       * in real renders. `mt-auto` on the stat/link row inside the card
       * is the sample's own footer-pinning pattern (line 353), not a bug
       * to route around. `max-height` still caps the box for unusually
       * long copy.
       */}
      <div
        ref={fitRef}
        className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(340px,1fr))] border border-line-2 bg-panel panel:mt-[var(--space-fit-margin)] panel:max-h-[760px]"
      >
        <div className="flex min-w-0 flex-col gap-[var(--space-fit-xs)] p-[clamp(16px,2.4vh,30px)_clamp(18px,2.2vw,30px)]">
          <div className="flex items-baseline gap-[12px] flex-wrap">
            <span className="font-display text-fit-xl leading-tight tracking-[-0.03em] text-fg">
              Leviathan
            </span>
            <span className="border border-line-2 px-2 py-[4px] text-[9.5px] tracking-[0.18em] text-dim">
              {LEVIATHAN_BADGE}
            </span>
          </div>
          <div className="text-fit-xs text-dim">{LEVIATHAN_SUBTITLE}</div>

          <p className="text-fit-lg text-accent-2">{LEVIATHAN_HOOK}</p>

          <p className="text-fit-base text-fg-2">{LEVIATHAN_SUMMARY}</p>

          <ul className="flex flex-col gap-[var(--space-fit-3xs)] text-fit-sm text-fg-2">
            {LEVIATHAN_BULLETS.map((bullet) => (
              <li key={bullet} className="flex gap-[12px]">
                <span aria-hidden="true" className="text-accent">
                  →
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-wrap items-end gap-[clamp(16px,2.4vw,32px)] border-t border-line pt-[15px]">
            {LEVIATHAN_STATS.map((stat) => (
              <StatCounter key={stat.id} stat={stat} />
            ))}

            <div className="ml-auto flex gap-[16px]">
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

        <div className="flex min-w-0 flex-col justify-center border-line bg-panel-2 p-[clamp(14px,2.2vh,26px)_clamp(16px,2vw,26px)] panel:border-l">
          <InferencePipeline />
        </div>
      </div>
    </Section>
  )
}
