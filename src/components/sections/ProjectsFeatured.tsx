import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { BulletList } from '@/components/sections/BulletList'
import { InferencePipeline } from '@/components/sections/leviathan/InferencePipeline'
import { StatCounter } from '@/components/sections/leviathan/StatCounter'
import { MlaProjectCard } from '@/components/sections/otherProjects/MlaProjectCard'
import {
  FeaturedProjectCardShell,
  ProjectCardLink,
  ProjectCardShell,
  ProjectCardStatsFooter,
  ProjectCardTitleRow,
} from '@/components/sections/ProjectCard'
import {
  LEVIATHAN_BADGE_LABEL,
  LEVIATHAN_BADGE_YEAR,
  LEVIATHAN_BULLETS,
  LEVIATHAN_HOOK,
  LEVIATHAN_LINKS,
  LEVIATHAN_STATS,
  LEVIATHAN_SUBTITLE,
  LEVIATHAN_SUMMARY,
} from '@/data/leviathan'
import { MLA_PROJECT } from '@/data/otherProjects'
import { getSectionMeta } from '@/data/sections'

const meta = getSectionMeta('projects')

/** Leviathan and MLA share one Projects section in reading order. */
export function ProjectsFeatured() {
  return (
    <Section id={meta.id} headingId="projects-heading">
      <SectionHeading
        number={meta.number}
        title={meta.title}
        headingId="projects-heading"
        label={meta.headingLabel}
      />

      {/* This wrapper stays at its natural height so both projects scroll without viewport-fit zoom. */}
      <div className="mt-[var(--space-fit-margin)] flex flex-col gap-[var(--space-md)]">
        <FeaturedProjectCardShell
          left={
            <ProjectCardShell>
              <ProjectCardTitleRow
                title={
                  <span className="font-display text-fit-xl leading-tight tracking-[-0.03em] text-fg">
                    Leviathan
                  </span>
                }
                badge={{ label: LEVIATHAN_BADGE_LABEL, year: LEVIATHAN_BADGE_YEAR }}
              />
              <div className="text-fit-xs text-dim">{LEVIATHAN_SUBTITLE}</div>

              <p className="text-fit-lg text-accent-2">{LEVIATHAN_HOOK}</p>
              <p className="text-fit-base text-fg-2">{LEVIATHAN_SUMMARY}</p>

              <BulletList
                items={LEVIATHAN_BULLETS}
                marker="→"
                markerClassName="text-accent"
                className="text-fit-sm text-fg-2"
              />

              <ProjectCardStatsFooter className="mt-auto">
                {LEVIATHAN_STATS.map((stat) => (
                  <StatCounter key={stat.id} stat={stat} />
                ))}

                <div className="ml-auto flex gap-[16px]">
                  {LEVIATHAN_LINKS.map((link) => (
                    <ProjectCardLink key={link.label} href={link.href} label={link.label} />
                  ))}
                </div>
              </ProjectCardStatsFooter>
            </ProjectCardShell>
          }
          right={<InferencePipeline />}
        />

        <MlaProjectCard project={MLA_PROJECT} />
      </div>
    </Section>
  )
}
