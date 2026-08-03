import type { OtherProject } from '@/data/otherProjects'
import { AgentCluster } from '@/components/sections/otherProjects/AgentCluster'
import { CopyInstallCommand } from '@/components/sections/otherProjects/CopyInstallCommand'
import { ProjectTag } from '@/components/sections/ProjectTag'

/**
 * One card on the second projects screen (mochi/style-match task 2): a
 * single component every entry in `OTHER_PROJECTS` (`src/data/
 * otherProjects.ts`) renders through, so adding a project is adding a data
 * entry, never a new JSX block here.
 *
 * A flex column that stretches to fill its grid row (mochi/style-match
 * audit, defect 1): the grid in `ProjectsOther.tsx` uses the default CSS
 * Grid `align-items: stretch`, so every card in a row shares the row's
 * height -- set by the row's tallest card -- rather than each card
 * sizing independently to its own content. The owner: "all project cards
 * should have the same standard size." A shorter card's leftover height
 * is not spread across every gap (that reintroduces the old ~300px void
 * a prior pass removed): it collects in exactly one place, the `mt-auto`
 * on the interactive row below (install command / agent-dot cluster),
 * which the owner explicitly said they don't mind: "i would not mind the
 * gap between content and the dots animation, that gap is small." The
 * footer stats row still follows immediately after with the column's
 * normal `gap`, so it lands flush with the card's bottom edge on every
 * card in the row, same as the row's tallest (content-defining) card.
 *
 * Measured with today's two real cards (real Chromium render): the gap
 * is 76.97px at 1920x1080 and 107.69px at 1440x700 -- both comfortably
 * small -- but 138.75px at 1440x900, driven by how many lines the MLA
 * description (much longer résumé copy than the Thesis description)
 * wraps to at that particular width, not by this mechanism; that is the
 * largest gap this pass measured and sits ~19px past the ~120px "stop
 * and report" guideline. Shrinking it further would mean either trimming
 * MLA's résumé-sourced copy or growing the Thesis dot-cluster row past
 * its own documented ~12px natural height, both out of scope here --
 * flagged rather than hidden.
 */
export function OtherProjectCard({ project }: { project: OtherProject }) {
  return (
    <article className="flex flex-col gap-[var(--space-fit-xs)] border border-line bg-panel p-[clamp(16px,2.4vh,28px)_clamp(18px,2.2vw,28px)] transition-[border-color,transform] duration-200 hover:border-accent motion-safe:hover:-translate-y-[3px]">
      <div className="flex items-start justify-between gap-[12px]">
        <h3 className="min-w-0 flex-1 font-display text-fluid-lg text-fg">{project.title}</h3>
        <ProjectTag label={project.badge.label} year={project.badge.year} blink={project.badge.blink} />
      </div>

      <p className="text-fit-lg text-accent-2">{project.tagline}</p>

      <p className="text-fit-sm text-fg-2">{project.description}</p>
      {project.srOnlyTitle ? <p className="sr-only">{project.srOnlyTitle}</p> : null}

      {project.interactive.kind === 'install' ? (
        <CopyInstallCommand command={project.interactive.command} className="mt-auto" />
      ) : (
        <AgentCluster className="mt-auto" />
      )}

      <div className="flex flex-wrap items-end gap-[26px] border-t border-line pt-[var(--space-fit-md)]">
        {project.stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="font-display text-[19px] leading-none text-fg">
              {stat.value}
              {stat.suffix ? <span className="ml-[3px] text-[10px] text-dim-2">{stat.suffix}</span> : null}
            </span>
            <span className="mt-[7px] text-[9.5px] tracking-[0.16em] text-dim-2">{stat.label}</span>
          </div>
        ))}
        {project.extraLink ? (
          <a
            href={project.extraLink.href}
            target="_blank"
            rel="noreferrer"
            className="ml-auto border-b border-line-2 pb-[2px] text-[12.5px] text-fg-2"
          >
            {project.extraLink.label} ↗
          </a>
        ) : null}
      </div>
    </article>
  )
}
