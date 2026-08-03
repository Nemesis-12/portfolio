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
       * Card sizes to its own content; leftover section height sits
       * OUTSIDE it, as section background (mochi/style-match task 1 --
       * same call as `ProjectsOther.tsx`, see that file for the fuller
       * writeup). A prior revision kept `flex-1` + `max-height:760px` +
       * `mt-auto` on the stat/link row specifically because a real render
       * of the design reference does the exact same thing -- but the owner
       * has since reviewed a real render of THIS build and called it wrong
       * here too: at 1440x900 that combination measured a 239px gap
       * between the last bullet and the stat footer, sitting in the
       * card's text column for no reason other than "the section has that
       * much leftover height to distribute." This is an approved
       * deviation from the reference for that reason.
       *
       * This wrapper (`flex-1` + `justify-center`) is what now consumes
       * the section's leftover vertical space, centering the
       * content-sized card within it -- the heading above stays pinned at
       * its normal top-of-section position, same mechanism as
       * `ProjectsOther.tsx`.
       */}
      <div className="flex flex-1 flex-col justify-center panel:mt-[var(--space-fit-margin)]">
        {/*
         * `grid-cols-[repeat(auto-fit,...)]` is the sample's own
         * unconditional grid (line 339); `minmax(340px,1fr)` alone
         * collapses it to one column once two 340px panes no longer fit
         * side by side, no `panel:` breakpoint switch needed for the
         * columns themselves. `items-start` stops CSS Grid's own default
         * (`align-items:stretch`) from forcing the shorter column to
         * stretch and match the taller one -- without it, whichever
         * column is shorter gets force-expanded with nothing inside it to
         * fill that space, recreating the same kind of interior void this
         * pass removes. The inference-pipeline column legitimately needs
         * more height than the text column at this content length; that
         * asymmetry is left alone rather than forced to match.
         *
         * No `max-h` here (mochi/style-match task 2 finding, applied here
         * too): a fixed cap disconnects this box's own rendered size from
         * its real content, which stops `useFitToViewport`'s shrink-to-fit
         * pass from ever seeing genuine overflow (it measures the OWNING
         * SECTION's rendered height, which a capped child can no longer
         * grow) -- see `ProjectsOther.tsx` for the real render that
         * exposed this. Leaving the box uncapped lets the section grow
         * with real content and the shrink pass correctly measure and
         * correct any future overflow instead.
         */}
        <div
          ref={fitRef}
          className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] items-start border border-line-2 bg-panel"
        >
          <div className="flex min-w-0 flex-col gap-[var(--space-fit-xs)] p-[clamp(16px,2.4vh,30px)_clamp(18px,2.2vw,30px)]">
            {/*
             * Title row is `justify-between` + `items-start`, not the
             * sample's literal `items-baseline`/`flex-wrap` (line 341):
             * the sample's own title ("LEVIATHAN") never wraps, so hugging
             * the badge right after it via plain `gap` reads as "same row"
             * there. Our title text differs card to card (résumé wording,
             * see `src/data/otherProjects.ts`) and the MLA card's title
             * DOES wrap to two lines, so `gap`-only hugging silently
             * degrades to the badge sitting immediately next to the title
             * word or dropping below a wrapped title (mochi/style-match
             * audit, defect 1). `justify-between` with the title in a
             * `min-w-0 flex-1` block pushes the badge to the row's right
             * edge regardless of title line count, and `items-start` keeps
             * it flush with the title's cap height instead of the
             * (undefined once multi-line) baseline. Same pattern reused
             * verbatim in `ProjectsOther.tsx` for both its cards.
             */}
            <div className="flex items-start justify-between gap-[12px]">
              <span className="min-w-0 flex-1 font-display text-fit-xl leading-tight tracking-[-0.03em] text-fg">
                Leviathan
              </span>
              <span className="shrink-0 whitespace-nowrap border border-line-2 px-2 py-[4px] text-[9.5px] tracking-[0.18em] text-dim">
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

            {/*
             * No `mt-auto`: the stat/link footer follows the bullets with
             * the column's normal `gap` (mochi/style-match task 1) rather
             * than being pinned to the bottom of a box stretched past its
             * content -- see the note above the outer grid.
             */}
            <div className="flex flex-wrap items-end gap-[clamp(16px,2.4vw,32px)] border-t border-line pt-[15px]">
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
      </div>
    </Section>
  )
}
