import type { OtherProject } from '@/data/otherProjects'
import { AgentCluster } from '@/components/sections/otherProjects/AgentCluster'
import { CopyInstallCommand } from '@/components/sections/otherProjects/CopyInstallCommand'
import { ProjectCardShell, ProjectCardStatsFooter, ProjectCardTitleRow } from '@/components/sections/ProjectCard'

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
    <ProjectCardShell
      as="article"
      className="border border-line bg-panel transition-[border-color,transform] duration-200 hover:border-accent motion-safe:hover:-translate-y-[3px]"
    >
      {/*
       * Title row is the shared `ProjectCardTitleRow` (`ProjectCard.tsx`):
       * stacks below 880px, side-by-side row at `panel:` (880px+), same
       * mechanism `ProjectsFeatured.tsx` uses for Leviathan's title/badge.
       * This card previously used a plain, unconditional
       * `items-start justify-between` row here and leaned only on
       * shrinking the title's own font at narrow widths (issue #346, see
       * the sizing note below) to keep it clear of the badge -- a second,
       * different fix for the same defect class the shared row now solves
       * generally, regardless of title length (issue #357).
       */}
      <ProjectCardTitleRow
        title={
          <h3 className="font-display text-fit-title leading-[1.45] text-fg panel:text-fluid-lg panel:leading-[1.6]">
            {/*
             * Title sizing is width-driven (`text-fluid-lg`, `--text-lg`
             * ~19.2-24px) ONLY from 880px up, restored via the `panel:`
             * override (issue #346 fix). Below 880px the base classes switch to
             * `text-fit-title` (`--text-fit-title`, a height-based clamp
             * ~11.5-16px, the same token `EducationExperience.tsx` already uses
             * for its own card/entry titles) with a tighter `leading-[1.45]`.
             *
             * At 375px, the unconditional width-based size (~20px, near its own
             * floor already) was still wide enough that MLA's four-word title
             * ("Multi-Head Latent Attention") wrapped one word per line in the
             * blocky `font-display` ("Press Start 2P") -- ballooning that card
             * to roughly triple the height of the one-line "Thesis" card below
             * it and breaking the shared title/description/metric/footer
             * rhythm the two cards are meant to share (issue #346). The
             * height-based scale shrinks with viewport HEIGHT, not width, so it
             * isn't pinned near its own max at narrow widths the way the
             * width-based scale is -- it renders small enough for the long
             * title to wrap to two lines instead of four, without touching the
             * `panel:`-gated desktop size at all.
             */}
            {project.title}
          </h3>
        }
        badge={{ label: project.badge.label, year: project.badge.year, blink: project.badge.blink }}
      />

      <p className="text-fit-lg text-accent-2">{project.tagline}</p>

      <p className="text-fit-sm text-fg-2">{project.description}</p>
      {project.srOnlyTitle ? <p className="sr-only">{project.srOnlyTitle}</p> : null}

      {project.interactive.kind === 'install' ? (
        <CopyInstallCommand command={project.interactive.command} className="mt-auto" />
      ) : (
        <AgentCluster className="mt-auto" />
      )}

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
