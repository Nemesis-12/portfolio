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
       * Cards size to their own content, and the section's leftover height
       * sits OUTSIDE them as background (mochi/style-match task 1) -- the
       * opposite of a prior revision's `flex-1` + `minmax(0,1fr)` card row,
       * which forced each card to stretch to fill the section and dumped
       * the leftover height inside the card as dead space above the
       * install command / agent-dot row. That was a deliberate, verified
       * reproduction of the design reference's OWN behaviour at the time
       * (see the git history on this file); the owner has since reviewed a
       * real render and called it wrong for this build, explicitly as a
       * deviation from the reference -- the cards are "too big for the
       * content they hold."
       *
       * This wrapper (`flex-1`, so it -- not the heading above it --
       * consumes the section's leftover vertical space) is a plain flex
       * column with `justify-center`, so the un-stretched, content-sized
       * grid below centres vertically WITHIN this wrapper only. The
       * heading stays pinned at its normal top-of-section position: only
       * the wrapper (and everything inside it) can grow, so
       * `.section-shell`'s own `justify-content:center` (on the
       * heading+wrapper block as a whole) has nothing left to redistribute
       * -- the wrapper already occupies 100% of the remaining height.
       */}
      <div className="flex flex-1 flex-col justify-center panel:mt-[var(--space-fit-margin)]">
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
        <div
          ref={fitRef}
          className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[clamp(14px,1.6vw,20px)]"
        >
          {OTHER_PROJECTS.map((project) => (
            <OtherProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </Section>
  )
}
