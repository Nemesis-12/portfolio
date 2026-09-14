import {
  ProjectCardLink,
  ProjectCardShell,
  ProjectCardTitleRow,
  TwoColumnProjectCardShell,
} from '@/components/sections/ProjectCard'
import { CopyInstallCommand } from '@/components/sections/otherProjects/CopyInstallCommand'
import type { OtherProject } from '@/data/otherProjects'

/**
 * Full-width MLA card under the Leviathan block (issue #384, mock option
 * "E -- command + link only"). Renders through `TwoColumnProjectCardShell`
 * (issue #389): two columns at 880px+ (stacked below), the left column
 * carrying the title, badge, tagline and description, the right column a
 * `bg-panel-2` strip holding only the install command and the package
 * link. Unlike the featured card's shell, this shell has no `dvh` floor --
 * this card takes its natural content height since it no longer carries
 * enough content to fill a tall box without stretching.
 */
export function MlaProjectCard({ project }: { project: OtherProject }) {
  return (
    <TwoColumnProjectCardShell
      left={
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
      }
      right={
        <>
          <CopyInstallCommand command={project.installCommand} />

          {project.extraLink ? (
            <div className="self-end">
              <ProjectCardLink href={project.extraLink.href} label={project.extraLink.label} />
            </div>
          ) : null}
        </>
      }
    />
  )
}
