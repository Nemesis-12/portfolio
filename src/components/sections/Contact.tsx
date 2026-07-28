import { Section } from '@/components/layout/Section'
import { SectionPlaceholder } from '@/components/layout/SectionPlaceholder'
import { sections } from '@/data/sections'

const meta = sections[5]

/** Contact placeholder. Real content lands in #321. */
export function Contact() {
  return (
    <Section id={meta.id} label={meta.label}>
      <SectionPlaceholder {...meta} />
    </Section>
  )
}
