import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { getSectionMeta } from '@/data/sections'

const meta = getSectionMeta('skills')

/**
 * Skills section shell (issue #319). The heading row now matches the
 * sample verbatim (`SectionHeading`, sample lines 461-465: "02" / "SKILLS",
 * no fourth/right-hand span). The skills graph itself (the node/edge SVG,
 * sample lines 467-488) is a separate ticket -- `meta.blurb` stands in for
 * it below the heading until that lands.
 */
export function Skills() {
  return (
    <Section id={meta.id} headingId="skills-heading">
      <SectionHeading number={meta.number} title={meta.title} headingId="skills-heading" />
      <p className="mt-[var(--space-fit-margin-tight)] max-w-3xl text-fluid-base font-mono text-fg-2">
        {meta.blurb}
      </p>
    </Section>
  )
}
