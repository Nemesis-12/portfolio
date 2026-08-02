import { GoBoardReplay } from '@/components/hero/GoBoardReplay'
import { HeroTagline } from '@/components/hero/HeroTagline'
import { Section } from '@/components/layout/Section'
import { HERO_NAME_FIRST, HERO_NAME_LAST, HERO_ROLE, HERO_TAGLINE } from '@/data/hero'
import { sections } from '@/data/sections'
import { cn } from '@/lib/cn'

const meta = sections[0]

/**
 * The hero (issue #316): states the role and name, types a one-shot
 * tagline, and replays all 180 real moves of AlphaGo vs. Lee Sedol Game 4
 * beside it via `GoBoardReplay`. The heading uses the hero step of the
 * fluid type scale (`--text-hero`, documented in src/styles/layout.css)
 * since it is the largest text on the page.
 *
 * `GoBoardReplay` owns its own animation timer (scoped to that leaf
 * component, not here) and checks `prefers-reduced-motion` itself, so
 * this component stays a plain, non-re-rendering shell.
 */
export function Hero() {
  return (
    <Section id={meta.id} label={meta.label}>
      <div className="grid w-full items-center gap-[var(--space-lg)] [grid-template-columns:repeat(auto-fit,minmax(330px,1fr))]">
        <div className="flex min-w-0 flex-col gap-[var(--space-sm)]">
          <p className="flex items-center gap-[var(--space-2xs)] font-mono text-fluid-xs tracking-[0.2em] text-dim">
            <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-accent" />
            {HERO_ROLE}
          </p>
          <h1 className={cn('font-display text-fluid-hero leading-tight text-fg')}>
            <span className="block">{HERO_NAME_FIRST}</span>
            <span className="inline-block bg-accent px-[0.05em] text-bg">{HERO_NAME_LAST}</span>
          </h1>
          <HeroTagline
            text={HERO_TAGLINE}
            className="max-w-[26ch] text-fluid-lg font-mono text-fg-2"
          />
        </div>

        <GoBoardReplay />
      </div>
    </Section>
  )
}
