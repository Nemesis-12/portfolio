import { Section } from '@/components/layout/Section'
import { SectionPlaceholder } from '@/components/layout/SectionPlaceholder'
import { sections } from '@/data/sections'

const meta = sections[4]

/** Education & experience placeholder. Real content lands in #320. */
export function EducationExperience() {
  return (
    <Section id={meta.id} label={meta.label}>
      <SectionPlaceholder {...meta} />
    </Section>
  )
}
