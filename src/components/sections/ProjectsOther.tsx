import { Section } from '@/components/layout/Section'
import { AgentCluster } from '@/components/sections/otherProjects/AgentCluster'
import { CopyInstallCommand } from '@/components/sections/otherProjects/CopyInstallCommand'
import {
  MLA_BADGE,
  MLA_DESCRIPTION,
  MLA_INSTALL_COMMAND,
  MLA_LINKS,
  MLA_TAGLINE,
  MLA_TITLE,
  OTHER_PROJECTS_LEAD,
  OTHER_PROJECTS_SUBTITLE,
  OTHER_PROJECTS_TITLE,
  THESIS_BADGE,
  THESIS_DESCRIPTION,
  THESIS_STATS,
  THESIS_TAGLINE,
  THESIS_TITLE,
} from '@/data/otherProjects'
import { sections } from '@/data/sections'

const meta = sections[2]

/**
 * Second projects screen: the MLA library and the in-progress thesis
 * (issue #318). This screen follows the featured Leviathan screen (#317)
 * and is built to read as its continuation rather than a repeat of it:
 *
 *   - No eyebrow number (`meta.eyebrow` is `''`) -- the design reference
 *     reused "01 · PROJECTS" on both project screens, which read as a
 *     rendering bug on two consecutive full-viewport screens. That
 *     duplicate is dropped entirely rather than swapped for a different
 *     number.
 *   - The heading keeps the same font-display family and the
 *     heading+subtitle pairing `ProjectsFeatured` uses for "Leviathan" /
 *     `LEVIATHAN_SUBTITLE`, so the two screens visibly belong together,
 *     but renders one step down the fluid scale (`text-fluid-xl` here vs
 *     `text-fluid-2xl` there) -- both stay `<h2>` for a correct landmark
 *     outline (each top-level section has exactly one top-level heading),
 *     with size carrying the "this is part two" signal instead of tag
 *     level.
 *
 * Two cards, side by side above 880px: the MLA library (a copyable install
 * command a visitor can use in one step) and the thesis (a running
 * indicator, its expected-completion date, and the animated agent-dot
 * cluster illustrating the thesis's own premise). All copy and figures
 * live in `src/data/otherProjects.ts`, sourced from `public/resume.pdf`;
 * this component is pure presentation. `AgentCluster` and
 * `CopyInstallCommand` each own their own state, scoped to themselves, so
 * this section never re-renders on their account.
 */
export function ProjectsOther() {
  return (
    <Section id={meta.id} label={meta.label}>
      <div className="flex h-full flex-col gap-[var(--space-sm)]">
        <div className="flex flex-col gap-[var(--space-2xs)]">
          <div className="flex items-baseline gap-[var(--space-xs)] flex-wrap">
            <h2 className="font-display text-fluid-xl leading-tight text-fg">{OTHER_PROJECTS_TITLE}</h2>
            <span className="text-2xs tracking-[0.18em] text-dim">{OTHER_PROJECTS_SUBTITLE}</span>
          </div>
          <p className="max-w-2xl text-fluid-base text-fg-2">{OTHER_PROJECTS_LEAD}</p>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-[var(--space-sm)] md:grid-cols-2">
          <article className="flex flex-col gap-[var(--space-xs)] border border-line bg-panel p-[var(--space-sm)]">
            <div className="flex items-baseline gap-[var(--space-2xs)] flex-wrap">
              <h3 className="font-display text-fluid-lg text-fg">{MLA_TITLE}</h3>
              <span className="ml-auto text-2xs tracking-[0.18em] text-dim-2">{MLA_BADGE}</span>
            </div>

            <p className="text-fluid-base text-accent-2">{MLA_TAGLINE}</p>

            <p className="text-fluid-sm text-fg-2">{MLA_DESCRIPTION}</p>

            <CopyInstallCommand command={MLA_INSTALL_COMMAND} />

            <div className="flex gap-[var(--space-sm)] border-t border-line pt-[var(--space-xs)]">
              {MLA_LINKS.map((link) => (
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
          </article>

          <article className="flex flex-col gap-[var(--space-xs)] border border-line bg-panel p-[var(--space-sm)]">
            <div className="flex items-baseline gap-[var(--space-2xs)] flex-wrap">
              <h3 className="font-display text-fluid-lg text-fg">Thesis</h3>
              <span
                aria-hidden="true"
                className="ml-auto flex items-center gap-[var(--space-3xs)] text-2xs tracking-[0.18em] text-accent-2"
              >
                <span className="inline-block h-[6px] w-[6px] rounded-full bg-accent-2 motion-safe:animate-pulse" />
                {THESIS_BADGE}
              </span>
            </div>

            <p className="text-fluid-base text-accent-2">{THESIS_TAGLINE}</p>

            <p className="text-fluid-sm text-fg-2">{THESIS_DESCRIPTION}</p>
            <p className="sr-only">{THESIS_TITLE}</p>

            <AgentCluster />

            <div className="mt-auto flex gap-[var(--space-md)] border-t border-line pt-[var(--space-xs)]">
              {THESIS_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="font-display text-fluid-sm text-fg">{stat.value}</span>
                  <span className="mt-[var(--space-3xs)] text-2xs tracking-[0.16em] text-dim-2">{stat.label}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </Section>
  )
}
