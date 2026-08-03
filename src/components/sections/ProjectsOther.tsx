import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { AgentCluster } from '@/components/sections/otherProjects/AgentCluster'
import { CopyInstallCommand } from '@/components/sections/otherProjects/CopyInstallCommand'
import {
  MLA_BADGE,
  MLA_DESCRIPTION,
  MLA_INSTALL_COMMAND,
  MLA_LINKS,
  MLA_STATS,
  MLA_TAGLINE,
  MLA_TITLE,
  THESIS_BADGE,
  THESIS_DESCRIPTION,
  THESIS_STATS,
  THESIS_TAGLINE,
  THESIS_TITLE,
} from '@/data/otherProjects'
import { getSectionMeta } from '@/data/sections'
import { useFitToViewport } from '@/lib/useFitToViewport'

const meta = getSectionMeta('more')
const packageLink = MLA_LINKS.find((link) => link.label === 'package')

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
 * Two cards, an `auto-fit` CSS grid side by side above ~640px (sample
 * line 424: `minmax(320px,1fr)`, no `panel:` breakpoint switch needed for
 * the columns themselves): the MLA library (a copyable install command a
 * visitor can use in one step) and the thesis (a running indicator, its
 * expected date, and the animated agent-dot cluster illustrating the
 * thesis's own premise). All copy and figures live in
 * `src/data/otherProjects.ts`, sourced from `public/resume.pdf`; this
 * component is pure presentation. `AgentCluster` and `CopyInstallCommand`
 * each own their own state, scoped to themselves, so this section never
 * re-renders on their account.
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
       * Matches the sample's `margin-top:clamp(18px,2.6vh,28px)`
       * (`--space-fit-margin`, `src/styles/layout.css`) and
       * `max-height:680px` on its `[data-fit]` grid (line 424), gated to
       * the 880px `panel:` breakpoint where `.section-shell` fixes the
       * section to one viewport tall in the first place, plus the `zoom`
       * shrink-to-fit safety net (`useFitToViewport`).
       *
       * `flex-1` is reinstated (mochi/style-match audit): a prior revision
       * dropped it, reasoning the sample's own inline `flex:1` on this
       * element "inflates" the box past its content, parking dead space
       * from `margin-top:auto` (on `CopyInstallCommand` and the
       * agent-cluster row) in the middle of the card. A real side-by-side
       * Chromium render of the decoded sample bytes disproves that: the
       * sample's grid fills flush from the heading row's padding-top down
       * to the section's padding-bottom with zero extra slack on either
       * edge -- `flex:1` is what consumes the section's free vertical
       * space so `.section-shell`'s `justify-content:center` has none
       * left to redistribute. Dropping `flex-1` left that free space
       * unconsumed, so centering split it evenly above AND below the
       * (heading + card row) block instead -- the empty band above the
       * heading seen in real renders. The `margin-top:auto` rows are the
       * sample's own footer-pinning pattern, not a bug. `max-height`
       * still caps the box for unusually long content, paired with the
       * `useFitToViewport` shrink-to-fit pass.
       */}
      {/*
       * Explicit `grid-rows` + `subgrid` (mochi/style-match audit, defect
       * 2): the sample's two cards (line 424-457) are plain flex columns
       * because ITS title/tagline/description text happens to be the
       * same length in both cards, so their internal rows land on the
       * same baselines for free. Our MLA title is the résumé's full name
       * ("Multi-Head Latent Attention", two lines) against "Thesis" (one
       * line) -- with independent flex columns the interactive row (the
       * install command / the agent-dot cluster) and the stat footer
       * below it end up at different heights per card, which is exactly
       * what the owner flagged ("the dot row floats ... does not line up
       * with anything in the neighbouring MLA card"). Five explicit row
       * tracks shared by both cards via `grid-template-rows:subgrid` on
       * each `<article>` (`row-span-5`) force title-row, tagline,
       * description, interactive element, and footer to the same height
       * band across both cards regardless of which card's content is
       * taller in a given band.
       *
       * All five tracks are content-sized (`auto`), not `minmax(0,1fr)`
       * (owner-approved divergence from the sample, mochi/style-match
       * slack audit): the résumé copy is short relative to a 100dvh
       * section, so a single `1fr` band -- combined with `self-end` on
       * `CopyInstallCommand`/`AgentCluster` -- dumped ~300px of dead air
       * in one spot (between the description and the interactive row)
       * while the row below it stayed cramped. `content-between`
       * (`align-content:space-between`) on this grid distributes
       * whatever height `flex-1` leaves unclaimed as gaps between the
       * five row bands.
       *
       * `items-start` on each `<article>` is required alongside that --
       * without it, grid items default to `align-self:stretch`, and a
       * real Chromium render showed the redistributed leftover space
       * inflating the row TRACKS themselves (not just the gaps between
       * them), stretching `CopyInstallCommand`'s own box from its
       * ~50px content height to ~119px, i.e. a visibly oversized bar
       * with a blank void around one line of text -- the same
       * "stranded content" defect this fix exists to remove, just moved
       * inside the element instead of around it. `items-start` keeps
       * every row's content pinned to its own intrinsic height
       * regardless of how much the track itself grows, so the
       * distributed slack reads purely as gaps between title, tagline,
       * description, the interactive element, and the footer, which is
       * what the sample's own "flush top to flush bottom, no internal
       * dead zone" footer-pinning intent actually implies.
       */}
      <div
        ref={fitRef}
        className="grid flex-1 content-between grid-cols-[repeat(auto-fit,minmax(320px,1fr))] grid-rows-[auto_auto_auto_auto_auto] gap-[clamp(14px,1.6vw,20px)] panel:mt-[var(--space-fit-margin)] panel:max-h-[680px]"
      >
        <article className="grid row-span-5 grid-rows-subgrid items-start gap-[var(--space-fit-xs)] border border-line bg-panel p-[clamp(16px,2.4vh,28px)_clamp(18px,2.2vw,28px)] transition-[border-color,transform] duration-200 hover:border-accent motion-safe:hover:-translate-y-[3px]">
          <div className="flex items-start justify-between gap-[12px]">
            <h3 className="min-w-0 flex-1 font-display text-fluid-lg text-fg">{MLA_TITLE}</h3>
            <span className="shrink-0 whitespace-nowrap text-2xs tracking-[0.18em] text-dim-2">{MLA_BADGE}</span>
          </div>

          <p className="text-fit-lg text-accent-2">{MLA_TAGLINE}</p>

          <p className="text-fit-sm text-fg-2">{MLA_DESCRIPTION}</p>

          <CopyInstallCommand command={MLA_INSTALL_COMMAND} />

          <div className="flex flex-wrap items-end gap-[26px] border-t border-line pt-[14px]">
            {MLA_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="font-display text-[19px] leading-none text-fg">
                  {stat.value}
                  {stat.suffix ? (
                    <span className="ml-[3px] text-[10px] text-dim-2">{stat.suffix}</span>
                  ) : null}
                </span>
                <span className="mt-[7px] text-[9.5px] tracking-[0.16em] text-dim-2">{stat.label}</span>
              </div>
            ))}
            {packageLink ? (
              <a
                href={packageLink.href}
                target="_blank"
                rel="noreferrer"
                className="ml-auto border-b border-line-2 pb-[2px] text-[12.5px] text-fg-2"
              >
                {packageLink.label} ↗
              </a>
            ) : null}
          </div>
        </article>

        <article className="grid row-span-5 grid-rows-subgrid items-start gap-[var(--space-fit-xs)] border border-line bg-panel p-[clamp(16px,2.4vh,28px)_clamp(18px,2.2vw,28px)] transition-[border-color,transform] duration-200 hover:border-accent motion-safe:hover:-translate-y-[3px]">
          <div className="flex items-start justify-between gap-[12px]">
            <h3 className="min-w-0 flex-1 font-display text-fluid-lg text-fg">Thesis</h3>
            <span
              aria-hidden="true"
              className="shrink-0 whitespace-nowrap text-2xs tracking-[0.18em] text-accent-2 motion-safe:[animation:pulse_1.8s_ease-in-out_infinite]"
            >
              ● {THESIS_BADGE}
            </span>
          </div>

          <p className="text-fit-lg text-accent-2">{THESIS_TAGLINE}</p>

          <p className="text-fit-sm text-fg-2">{THESIS_DESCRIPTION}</p>
          <p className="sr-only">{THESIS_TITLE}</p>

          <AgentCluster />

          <div className="flex gap-[26px] border-t border-line pt-[14px]">
            {THESIS_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="font-display text-[19px] leading-none text-fg">
                  {stat.value}
                  {stat.suffix ? (
                    <span className="ml-[3px] text-[10px] text-dim-2">{stat.suffix}</span>
                  ) : null}
                </span>
                <span className="mt-[7px] text-[9.5px] tracking-[0.16em] text-dim-2">{stat.label}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </Section>
  )
}
