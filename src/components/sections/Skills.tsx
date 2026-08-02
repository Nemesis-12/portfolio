import { Section } from '@/components/layout/Section'
import { SectionPlaceholder } from '@/components/layout/SectionPlaceholder'
import { getSectionMeta } from '@/data/sections'

const meta = getSectionMeta('skills')

/** Skills graph placeholder. Real content lands in #319. */
export function Skills() {
  return (
    <Section id={meta.id} headingId="skills-heading">
      <SectionPlaceholder {...meta} headingId="skills-heading" />
    </Section>
  )
}
