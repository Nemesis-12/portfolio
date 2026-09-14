import { ProjectCardShell, ProjectCardStatsFooter, ProjectCardTitleRow } from '@/components/sections/ProjectCard'
import { CopyInstallCommand } from '@/components/sections/otherProjects/CopyInstallCommand'
import type { OtherProject } from '@/data/otherProjects'

/** Compact project card used for the MLA row below Leviathan. */
export function OtherProjectCard({ project }: { project: OtherProject }) {
  return (
    <ProjectCardShell
      as="article"
      className="border border-line bg-panel transition-[border-color,transform] duration-200 hover:border-accent motion-safe:hover:-translate-y-[3px]"
    >
      <ProjectCardTitleRow
        title={
          <h3 className="font-display text-fit-title leading-[1.45] text-fg panel:text-fluid-lg panel:leading-[1.6]">
            {project.title}
          </h3>
        }
        badge={{ label: project.badge.label, year: project.badge.year }}
      />

      <p className="text-fit-lg text-accent-2">{project.tagline}</p>
      <p className="text-fit-sm text-fg-2">{project.description}</p>

      <CopyInstallCommand command={project.installCommand} className="mt-auto" />

      <ProjectCardStatsFooter>
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
      </ProjectCardStatsFooter>
    </ProjectCardShell>
  )
}
