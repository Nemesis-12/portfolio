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
       */}
      <div
        ref={fitRef}
        className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[clamp(14px,1.6vw,20px)] panel:mt-[var(--space-fit-margin)] panel:max-h-[680px]"
      >
        <article className="flex flex-col gap-[var(--space-fit-xs)] border border-line bg-panel p-[clamp(16px,2.4vh,28px)_clamp(18px,2.2vw,28px)] transition-[border-color,transform] duration-200 hover:border-accent motion-safe:hover:-translate-y-[3px]">
          <div className="flex items-baseline gap-[var(--space-2xs)] flex-wrap">
            <h3 className="font-display text-fluid-lg text-fg">{MLA_TITLE}</h3>
            <span className="ml-auto text-2xs tracking-[0.18em] text-dim-2">{MLA_BADGE}</span>
          </div>

          <p className="text-fit-lg text-accent-2">{MLA_TAGLINE}</p>

          <p className="text-fit-sm text-fg-2">{MLA_DESCRIPTION}</p>

          <CopyInstallCommand command={MLA_INSTALL_COMMAND} />

          <div className="flex flex-wrap items-end gap-[var(--space-md)] border-t border-line pt-[var(--space-fit-xs)]">
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

        <article className="flex flex-col gap-[var(--space-fit-xs)] border border-line bg-panel p-[clamp(16px,2.4vh,28px)_clamp(18px,2.2vw,28px)] transition-[border-color,transform] duration-200 hover:border-accent motion-safe:hover:-translate-y-[3px]">
          <div className="flex items-baseline gap-[var(--space-2xs)] flex-wrap">
            <h3 className="font-display text-fluid-lg text-fg">Thesis</h3>
            <span
              aria-hidden="true"
              className="ml-auto text-2xs tracking-[0.18em] text-accent-2 motion-safe:[animation:pulse_1.8s_ease-in-out_infinite]"
            >
              ● {THESIS_BADGE}
            </span>
          </div>

          <p className="text-fit-lg text-accent-2">{THESIS_TAGLINE}</p>

          <p className="text-fit-sm text-fg-2">{THESIS_DESCRIPTION}</p>
          <p className="sr-only">{THESIS_TITLE}</p>

          <AgentCluster />

          <div className="mt-auto flex gap-[var(--space-md)] border-t border-line pt-[var(--space-fit-xs)]">
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
