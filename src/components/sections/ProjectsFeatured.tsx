import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { InferencePipeline } from '@/components/sections/leviathan/InferencePipeline'
import { StatCounter } from '@/components/sections/leviathan/StatCounter'
import { OtherProjectCard } from '@/components/sections/otherProjects/OtherProjectCard'
import { ProjectCardShell, ProjectCardStatsFooter, ProjectCardTitleRow } from '@/components/sections/ProjectCard'
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
        label={meta.label2}
      />

      {/* This wrapper stays at its natural height so both projects scroll without viewport-fit zoom. */}
      <div className="mt-[var(--space-fit-margin)] flex flex-col gap-[var(--space-md)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] border border-line-2 bg-panel panel:min-h-[68dvh]">
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

            <ul className="flex flex-col gap-[var(--space-fit-3xs)] text-fit-sm text-fg-2">
              {LEVIATHAN_BULLETS.map((bullet) => (
                <li key={bullet} className="flex gap-[12px]">
                  <span aria-hidden="true" className="text-accent">
                    →
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <ProjectCardStatsFooter className="mt-auto">
              {LEVIATHAN_STATS.map((stat) => (
                <StatCounter key={stat.id} stat={stat} />
              ))}

              <div className="ml-auto flex gap-[16px]">
                {LEVIATHAN_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="border-b border-line-2 pb-[2px] text-[12.5px] text-fg-2"
                  >
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </ProjectCardStatsFooter>
          </ProjectCardShell>

          <div className="flex min-w-0 flex-col justify-center border-line bg-panel-2 p-[var(--space-fit-md)_clamp(16px,2vw,26px)] panel:border-l">
            <InferencePipeline />
          </div>
        </div>

        <div className="grid">
          <OtherProjectCard project={MLA_PROJECT} />
        </div>
      </div>
    </Section>
  )
}
