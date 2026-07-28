import { Section } from '@/components/layout/Section'
import { sections } from '@/data/sections'
import { cn } from '@/lib/cn'

const meta = sections[0]

/**
 * Hero placeholder. The real Go board replay (#316) replaces the body
 * below; the display heading uses the hero step of the fluid type scale
 * (`--text-hero`, documented in `src/styles/layout.css`) since it is the
 * largest text on the page.
 */
export function Hero() {
  return (
    <Section id={meta.id} label={meta.label}>
      <div className="flex max-w-3xl flex-col gap-[var(--space-sm)]">
        <p className={cn('text-fluid-xs font-mono tracking-[0.2em] text-dim')}>{meta.eyebrow}</p>
        <h1 className={cn('font-display text-fluid-hero leading-tight text-fg')}>{meta.title}</h1>
        <p className={cn('text-fluid-lg font-mono text-fg-2')}>{meta.blurb}</p>
      </div>
    </Section>
  )
}
