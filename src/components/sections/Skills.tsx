import { Section } from '@/components/layout/Section'
import { SectionPlaceholder } from '@/components/layout/SectionPlaceholder'
import { sections } from '@/data/sections'

const meta = sections[3]

/** Skills graph placeholder. Real content lands in #319. */
export function Skills() {
  return (
    <Section id={meta.id} label={meta.label}>
      <SectionPlaceholder {...meta} />
    </Section>
  )
}
