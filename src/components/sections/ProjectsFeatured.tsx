import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { InferencePipeline } from '@/components/sections/leviathan/InferencePipeline'
import { StatCounter } from '@/components/sections/leviathan/StatCounter'
import { ProjectCardShell, ProjectCardStatsFooter, ProjectCardTitleRow } from '@/components/sections/ProjectCard'
import {
  LEVIATHAN_BADGE_LABEL,
  LEVIATHAN_BADGE_YEAR,
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
       * Owner report (with screenshots): on a tall desktop viewport the
       * card floated in the vertical middle of the section with a large
       * dead band above AND below it (~250px each at a ~1500px-tall
       * viewport). Cause: this wrapper's `flex-1` swallows the section's
       * leftover vertical height, and `justify-center` then splits that
       * leftover evenly above and below the content-sized card below --
       * those two halves were the bands. First fix: giving the card itself
       * (the `fitRef` grid) `flex-1` too, so it grows to fill all the space
       * this wrapper hands it. The owner reviewed THAT render and called it
       * too far the other way -- the card filled the entire section, an
       * awkward full-height stretch they'd already rejected once before.
       * Current fix: `flex-1` is removed from the grid below and replaced
       * with `panel:min-h-[68dvh]` -- a height FLOOR rather than a claim on
       * all remaining space. The grid still grows well past its own content
       * height, but stops short of the section edge, leaving the wrapper's
       * `justify-center` a small remainder to split above and below instead
       * of none at all. `68dvh` is a tuning value, not derived from
       * anything measured -- expect the owner to adjust it after seeing
       * this render. `justify-center` stays on this wrapper for the same
       * reason as before: it centers whatever leftover height remains once
       * the grid below has taken its floor.
       *
       * A prior revision kept `flex-1` + `max-height:760px` + `mt-auto` on
       * the stat/link row specifically because a real render of the design
       * reference does the exact same thing -- but the owner reviewed a
       * real render of THIS build and called it wrong: at 1440x900 that
       * combination measured a 239px gap between the last bullet and the
       * stat footer, sitting INSIDE the card's text column for no reason
       * other than "the section has that much leftover height to
       * distribute." That is why the fix above does not restore either the
       * `max-height` cap (see the note on the grid div below) or the
       * `mt-auto` on the stat/link row -- both were the mechanism that
       * produced that in-card gap, and neither is being brought back.
       *
       * This wrapper (`flex-1` + `justify-center`) is what consumes the
       * section's leftover vertical space and hands it to the card below
       * -- the heading above stays pinned at its normal top-of-section
       * position, same mechanism as `ProjectsOther.tsx`.
       */}
      <div className="mt-[var(--space-fit-margin)] flex flex-1 flex-col justify-center">
        {/*
         * `grid-cols-[repeat(auto-fit,...)]` is the sample's own
         * unconditional grid (line 339); `minmax(340px,1fr)` alone
         * collapses it to one column once two 340px panes no longer fit
         * side by side, no `panel:` breakpoint switch needed for the
         * columns themselves. CSS Grid's default `align-items: stretch`
         * is deliberately left in effect (mochi/style-match audit, defect
         * 3): an `items-start` override here previously left the
         * inference-pipeline column's `bg-panel-2` fill only as tall as
         * `InferencePipeline`'s own content, short of the taller text
         * column's height, so the panel's darker background stopped short
         * of the card's bottom edge with the card's own `bg-panel`
         * showing through the gap underneath -- a visual glitch, not an
         * interior-void case (the void concern that motivated
         * `items-start` doesn't apply here: this column already carries a
         * background colour and a `justify-center` flex column ready to
         * centre its content in extra height, so stretching it fills the
         * column with intentional panel chrome instead of dead space).
         * With stretch restored, the right column's box -- and its
         * background -- now matches the left (taller, content-defining)
         * column's height on every render.
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
         *
         * The design reference caps this element at `max-height:760px`
         * (line 338); this build deliberately does not restore that cap,
         * because on the owner's screen this card already renders ~858px
         * tall -- a 760px cap would SHRINK it below its natural content
         * height, which is the opposite of the fix below. This is an
         * approved deviation from the reference.
         *
         * This element previously carried `flex-1` here (the owner's
         * float/dead-band fix, see the wrapper comment above), but the
         * owner reviewed that render and called it too far: `flex-1` let
         * the card consume ALL of the section's remaining height, filling
         * the section edge-to-edge -- an awkward full-height stretch the
         * owner had already rejected once before. `flex-1` is now replaced
         * with `panel:min-h-[68dvh]`, a height FLOOR instead of a claim on
         * all remaining space: the card grows well past its own content
         * height without swallowing whatever the wrapper's `justify-center`
         * has left over, so a modest band remains above and below rather
         * than none. `68dvh` is a tuning value the owner will adjust after
         * seeing this render, not a figure derived from the 858px/239px
         * measurements above. `dvh` matches `.section-shell`'s own
         * `min-height: 100dvh` (`src/styles/layout.css`). Gated behind
         * `panel:` because below 880px `.section-shell` has no fixed
         * height at all -- sections are ordinary flow content there, so a
         * viewport-height floor would be wrong (see `useFitToViewport.ts`,
         * which is likewise only active at/above that width).
         *
         * Re-checked against `useFitToViewport` with `min-h` in place of
         * `flex-1`: the note above still holds. The hook measures the
         * OWNING SECTION's `getBoundingClientRect()`, not this element's --
         * a `min-height` floor, like `flex-1` before it, only sets a lower
         * bound on this box's size and never caps it, so the box still
         * cannot under-report its true rendered height, and the section
         * can still grow taller than the viewport when content genuinely
         * overflows. The shrink pass keeps seeing real overflow exactly as
         * before; swapping the growth mechanism here doesn't change what
         * the hook measures.
         */}
        {/*
         * `minmax(min(340px,100%),1fr)`, not a bare `minmax(340px,1fr)`:
         * the bare form's 340px floor can exceed the section's available
         * inline size below 880px (owner review, #314) -- wrapping it in
         * `min(...,100%)` caps the floor at the grid's own width whenever
         * that's narrower than 340px, so the column can never demand more
         * room than actually exists. `min(340px,100%) === 340px` whenever
         * the container is wide enough, so this is a no-op above that
         * width -- desktop is unaffected.
         */}
        <div
          ref={fitRef}
          className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] border border-line-2 bg-panel panel:min-h-[68dvh]"
        >
          <ProjectCardShell>
            {/*
             * Title row is the shared `ProjectCardTitleRow`
             * (`ProjectCard.tsx`): stacks into a column below 880px and
             * only becomes a side-by-side row at `panel:` (880px+) so a
             * long title can never collide with the badge at any width,
             * regardless of how many lines it wraps to. Its own doc
             * comment (`ProjectCard.tsx`) has the full history -- this was
             * previously duplicated here and, differently, in
             * `OtherProjectCard.tsx` (issue #357).
             */}
            <ProjectCardTitleRow
              title={
                <span className="font-display text-fit-xl leading-tight tracking-[-0.03em] text-fg">
                  Leviathan
                </span>
              }
              badge={{ label: LEVIATHAN_BADGE_LABEL, year: LEVIATHAN_BADGE_YEAR }}
            />
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
             * `mt-auto` is back: the outer grid now carries
             * `panel:min-h-[68dvh]` (see the note above the outer grid), a
             * height FLOOR taller than the card's own content, so there is
             * slack to collect somewhere in this column. The owner chose to
             * collect it ABOVE the footer -- `mt-auto` pins the footer to
             * the bottom of the card's content column -- rather than below
             * it, where it previously floated the footer in the middle of
             * the card (owner report, issue #357 follow-up). This is the
             * known cost of a shared floor rather than a content-sized
             * card: a prior full-height (`flex-1`) revision measured a
             * 239px gap at 1440x900 between the last bullet and the footer
             * (see the note above the outer grid); with the card now
             * floored at `panel:min-h-[68dvh]` instead of stretched to fill
             * the whole section, that gap is smaller, but the mechanism
             * absorbing it is the same `mt-auto`.
             */}
            <ProjectCardStatsFooter className="mt-auto">
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
            </ProjectCardStatsFooter>
          </ProjectCardShell>

          <div className="flex min-w-0 flex-col justify-center border-line bg-panel-2 p-[clamp(14px,2.2vh,26px)_clamp(16px,2vw,26px)] panel:border-l">
            <InferencePipeline />
          </div>
        </div>
      </div>
    </Section>
  )
}
