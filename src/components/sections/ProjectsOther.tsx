import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { OtherProjectCard } from '@/components/sections/otherProjects/OtherProjectCard'
import { OTHER_PROJECTS } from '@/data/otherProjects'
import { getSectionMeta } from '@/data/sections'
import { useFitToViewport } from '@/lib/useFitToViewport'

const meta = getSectionMeta('more')

/**
 * Second projects screen: the MLA library and the in-progress thesis
 * (issue #318). This screen follows the featured Leviathan screen (#317)
 * and, per the sample, reuses the exact same heading row -- "01 ·
 * PROJECTS", with the right-hand label changed to "THE OTHER STUFF I
 * WORKED ON" (sample lines 417-422, via the shared `SectionHeading` and
 * `getSectionMeta('more')`). The sample deliberately repeats "01" on both
 * project screens rather than treating this as a second numbered section;
 * that duplicate is chrome, not a defect (mochi/style-match audit --
 * see `src/data/sections.ts` and `src/data/otherProjects.ts` for the full
 * history of that call). The sample also opens straight into the two
 * cards with no lead paragraph under the heading, so none is rendered
 * here either.
 *
 * All copy and figures live in `src/data/otherProjects.ts`, sourced from
 * `public/resume.pdf`; this component is pure presentation. `AgentCluster`
 * and `CopyInstallCommand` (rendered inside `OtherProjectCard`) each own
 * their own state, scoped to themselves, so this section never re-renders
 * on their account.
 */
export function ProjectsOther() {
  const fitRef = useFitToViewport<HTMLDivElement>()

  return (
    <Section id={meta.id} headingId="more-heading">
      <SectionHeading
        number={meta.number}
        title={meta.title}
        headingId="more-heading"
        label={meta.label2}
      />

      {/*
       * Owner report (with screenshots): on a tall desktop viewport the
       * card grid floated in the vertical middle of the section with a
       * large dead band above AND below it (~250px each at a ~1500px-tall
       * viewport). Cause: this wrapper's `flex-1` swallows the section's
       * leftover vertical height, and `justify-center` then splits that
       * leftover evenly above and below the content-sized grid below --
       * those two halves were the bands. Fix: the grid itself (the
       * `fitRef` element) now also carries `flex-1`, so it grows to fill
       * the space this wrapper hands it instead of staying content-sized
       * and floating within it. `justify-center` stays on this wrapper
       * (it still centers on the rare frame where the grid's own
       * min-content height is shorter than the space available) but with
       * the grid stretching, there is normally no leftover left to center.
       *
       * This is a different fix from a prior revision's `flex-1` +
       * `minmax(0,1fr)` card row, which forced each individual CARD to
       * stretch and dumped the leftover height inside each card as dead
       * space above the install command / agent-dot row. That was a
       * deliberate, verified reproduction of the design reference's OWN
       * behaviour at the time (see the git history on this file); the
       * owner reviewed a real render and called it wrong for this build --
       * the cards were "too big for the content they hold." The `flex-1`
       * added here is on the outer GRID container, not on the individual
       * cards, so it does not reintroduce that per-card stretching; see
       * `OtherProjectCard.tsx` for how row-mate height equalisation is
       * still handled (`align-items: stretch` + a small, deliberate
       * `mt-auto` inside the shorter card).
       *
       * This wrapper (`flex-1`, so it -- not the heading above it --
       * consumes the section's leftover vertical space) is a plain flex
       * column with `justify-center`, so the grid below now fills that
       * leftover space instead of floating within it. The heading stays
       * pinned at its normal top-of-section position: only the wrapper
       * (and everything inside it) can grow, so `.section-shell`'s own
       * `justify-content:center` (on the heading+wrapper block as a whole)
       * has nothing left to redistribute -- the wrapper already occupies
       * 100% of the remaining height.
       *
       * `mt-` was `panel:`-only, leaving zero gap below 880px between the
       * "THE OTHER STUFF I WORKED ON" caption and the first card (#314
       * owner review) -- unconditional now, same margin at every width.
       */}
      <div className="mt-[var(--space-fit-margin)] flex flex-1 flex-col justify-center">
        {/*
         * `auto-fit`/`minmax(320px,1fr)` (sample line 424) is also the
         * mechanism that lets this grid reflow as more projects are added
         * later (mochi/style-match task 2): 2 across today, 3 across or
         * 2x2 as `OTHER_PROJECTS` (`src/data/otherProjects.ts`) grows. No
         * column count is hardcoded anywhere in this file. 320px is the
         * minimum column width where the longest card title (MLA's
         * two-line name) still reads comfortably without cramping the stat
         * footer -- verified by temporarily rendering 3, 4, and 6 cards
         * (mochi/style-match task 2 verification; no extra project entries
         * are committed).
         *
         * No `max-h` here (deliberately, unlike the sample's own
         * `max-height:680px` on this element): a fixed cap disconnects
         * this box's own rendered size from its real content once card
         * count grows past what 2 cards needed, so `useFitToViewport`'s
         * shrink-to-fit pass -- which measures the OWNING SECTION's
         * rendered height against the viewport -- silently stops seeing
         * the overflow (the capped box reports its capped size, not its
         * true, taller content extent) and never engages. Verified via a
         * real render: with the cap in place, 6 cards overflowed the
         * section by 314px with `zoom` never leaving `1`; without it, the
         * section's own box grows with its real content and the shrink
         * pass correctly measures and corrects the overflow (see task 2's
         * card-count ceiling notes for how far that shrinking stays
         * legible).
         *
         * This build deliberately does not restore that cap even now that
         * `flex-1` has been added below (owner's float/dead-band fix, see
         * the wrapper comment above), because on the owner's screen this
         * grid already renders ~858px tall for 2 cards -- a 680px cap
         * would SHRINK it below its natural content height, the opposite
         * of the fix. This is an approved deviation from the reference.
         *
         * Re-verified with `flex-1` added: the reasoning above still
         * holds. `flex-1` only lets this box grow to consume leftover
         * space handed to it by its `flex-col` parent; it does not add a
         * max-height, and a flex item's default `min-height: auto` still
         * stops it from ever shrinking below its own content height. So
         * this box still can't under-report its true size, and the
         * section can still grow taller than the viewport when content
         * genuinely overflows -- the shrink pass keeps seeing real
         * overflow via `section.getBoundingClientRect()` exactly as
         * before.
         *
         * CSS Grid's own default (`align-items: stretch`) is deliberately
         * left in effect here (mochi/style-match audit, defect 1): a prior
         * pass overrode it with `items-start` specifically so a shorter
         * row-mate (the Thesis card) would not stretch to match the
         * taller one, but the owner reviewed that render and asked for
         * the opposite -- "all project cards should have the same
         * standard size." Stretch now sizes every card in a row to the
         * row's tallest card; `OtherProjectCard.tsx` puts the resulting
         * leftover height in exactly one place inside the shorter card
         * (an `mt-auto` on its interactive row, right before the
         * install-command/agent-dot element) rather than spreading it
         * across every gap, keeping that leftover small instead of
         * reintroducing the old ~300px void -- see that file for the full
         * writeup and the owner's own "that gap is small [and] I would
         * not mind [it]" call. Title rows still start flush with each
         * other regardless (both cards' tops sit on the same grid-row
         * edge either way).
         */}
        {/* minmax(min(320px,100%),1fr): same overflow guard as ProjectsFeatured's grid -- caps the column floor at the container's own width below 880px, a no-op above it. */}
        {/*
         * `auto-rows-fr` (below 880px, `auto-fit` only fits one column, so
         * MLA and Thesis land in two separate grid ROWS, not two columns in
         * one row -- `align-items: stretch` only equalises siblings sharing
         * a row, so it did nothing there and Thesis rendered at its own,
         * shorter, content height). Flexed auto rows with an indefinite
         * grid-container height resolve every row to the tallest row's own
         * content size, so both cards end up equal without touching the
         * 880px+ single-row case (a no-op there, same as today).
         */}
        <div
          ref={fitRef}
          className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] auto-rows-fr gap-[clamp(14px,1.6vw,20px)]"
        >
          {OTHER_PROJECTS.map((project) => (
            <OtherProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </Section>
  )
}
