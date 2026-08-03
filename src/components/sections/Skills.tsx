import { Section } from '@/components/layout/Section'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { SkillsGraph } from '@/components/sections/skills/SkillsGraph'
import { getSectionMeta } from '@/data/sections'

const meta = getSectionMeta('skills')

/**
 * Skills section (issue #319). The heading row matches the sample verbatim
 * (`SectionHeading`, sample lines 461-465: "02" / "SKILLS", no fourth/
 * right-hand span). Below it, the interactive skills graph
 * (`SkillsGraph.tsx`) has landed in place of the `meta.blurb` placeholder
 * paragraph this file used to render: four colour-coded hubs and their
 * member nodes as absolutely-positioned buttons over an SVG edge layer,
 * with every node's usage note reachable by hover, focus, or tap. Graph
 * content lives in `src/data/skills.ts`; the pure edge/state derivation
 * lives in `src/lib/skills/graph.ts`.
 */
export function Skills() {
  return (
    <Section id={meta.id} headingId="skills-heading">
      <SectionHeading number={meta.number} title={meta.title} headingId="skills-heading" />
      <SkillsGraph />
    </Section>
  )
}
