import { ProjectCardShell, ProjectCardTitleRow } from '@/components/sections/ProjectCard'
import { CopyInstallCommand } from '@/components/sections/otherProjects/CopyInstallCommand'
import type { OtherProject } from '@/data/otherProjects'

/**
 * Full-width MLA card under the Leviathan block (issue #384, mock option
 * "E -- command + link only"). Two columns at 880px+ (stacked below): the
 * left column carries the title, badge, tagline and description; the
 * right column is a `bg-panel-2` strip holding only the install command
 * and the package link, spaced apart with `justify-between` instead of a
 * stats footer. Unlike the shared Leviathan/other-project shell, this
 * card takes its natural content height -- no `dvh` floor -- since it no
 * longer carries enough content to fill a tall box without stretching.
 */
export function MlaProjectCard({ project }: { project: OtherProject }) {
  return (
    <div className="grid grid-cols-1 border border-line-2 bg-panel panel:grid-cols-[1.5fr_1fr]">
      <ProjectCardShell>
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
      </ProjectCardShell>

      <div className="flex min-w-0 flex-col justify-between gap-[var(--space-fit-md)] border-t border-line bg-panel-2 p-[var(--space-fit-md)_clamp(16px,2.2vw,30px)] panel:border-l panel:border-t-0">
        <CopyInstallCommand command={project.installCommand} />

        {project.extraLink ? (
          <a
            href={project.extraLink.href}
            target="_blank"
            rel="noreferrer"
            className="self-start border-b border-line-2 pb-[2px] text-[12.5px] text-fg-2"
          >
            {project.extraLink.label} ↗
          </a>
        ) : null}
      </div>
    </div>
  )
}
