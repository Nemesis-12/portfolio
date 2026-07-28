import { Section } from '@/components/layout/Section'
import { SectionPlaceholder } from '@/components/layout/SectionPlaceholder'
import { sections } from '@/data/sections'

const meta = sections[1]

/** Featured project (Leviathan) placeholder. Real content lands in #317. */
export function ProjectsFeatured() {
  return (
    <Section id={meta.id} label={meta.label}>
      <SectionPlaceholder {...meta} />
    </Section>
  )
}
