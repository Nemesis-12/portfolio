import { Section } from '@/components/layout/Section'
import { SectionPlaceholder } from '@/components/layout/SectionPlaceholder'
import { sections } from '@/data/sections'

const meta = sections[2]

/**
 * Secondary projects screen placeholder. Per the spec's fixed defect, this
 * screen deliberately has no eyebrow number -- the reference reused
 * "01 PROJECTS" on both project screens, which reads as a rendering bug.
 * Real content lands in #318.
 */
export function ProjectsOther() {
  return (
    <Section id={meta.id} label={meta.label}>
      <SectionPlaceholder {...meta} />
    </Section>
  )
}
