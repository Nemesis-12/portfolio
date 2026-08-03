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
 * A plain flex column, content-sized top to bottom (mochi/style-match task
 * 1): no row is `minmax(0,1fr)` and nothing here forces the card taller
 * than its own content. Any leftover height between the card grid and the
 * section's edges is absorbed by the section wrapper in `ProjectsOther.tsx`,
 * not parked inside the card -- see that file for why.
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
        <CopyInstallCommand command={project.interactive.command} />
      ) : (
        <AgentCluster />
      )}

      <div className="flex flex-wrap items-end gap-[26px] border-t border-line pt-[14px]">
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
