import type { CSSProperties } from 'react'
import { GoBoardReplay } from '@/components/hero/GoBoardReplay'
import { HeroTagline } from '@/components/hero/HeroTagline'
import { Section } from '@/components/layout/Section'
import {
  HERO_CTA_LABEL,
  HERO_NAME_FIRST,
  HERO_NAME_LAST,
  HERO_ROLE,
  HERO_STAT_CURRENT_LABEL,
  HERO_STAT_CURRENT_VALUE,
  HERO_STAT_STUDY_LABEL,
  HERO_STAT_STUDY_VALUE,
  HERO_TAGLINE,
} from '@/data/hero'
import { getSectionMeta } from '@/data/sections'
import { cn } from '@/lib/cn'

const meta = getSectionMeta('top')

/**
 * Per-letter hover rotations for each name line, read off the sample in
 * order (`ideas/Portfolio.html` lines 300 and 303: `F`=-3deg, `A`=3deg,
 * `R`=-2deg, `H`=3deg, `A`=-3deg, `N`=2deg, then `M`=2deg, `O`=-2deg,
 * `H`=3deg, `A`=-3deg, `M`=2deg, `M`=-2deg, `E`=3deg, `D`=-3deg). Applied
 * by letter INDEX, not by which letter it is, so this still works if
 * `HERO_NAME_FIRST`/`HERO_NAME_LAST` (resume content) ever change length --
 * cycling via modulo rather than assuming an exact match.
 */
const FIRST_LINE_ROTATIONS = [-3, 3, -2, 3, -3, 2]
const LAST_LINE_ROTATIONS = [2, -2, 3, -3, 2, -2, 3, -3]

interface NameLetterProps {
  letter: string
  rotationDeg: number
  hoverColorClassName: string
}

/**
 * One letter of the hero name (sample lines 300, 303): an individually
 * hoverable inline-block that lifts and tilts on hover. `aria-hidden` --
 * the accessible name for the whole name comes from the `aria-label` on
 * the parent `<h1>` (see `Hero`) so a screen reader announces it as one
 * continuous string, not as isolated single-letter nodes.
 */
function NameLetter({ letter, rotationDeg, hoverColorClassName }: NameLetterProps) {
  return (
    <span
      aria-hidden="true"
      // `--hero-letter-rot` feeds `.hero-name-letter:hover`'s
      // `rotate(var(--hero-letter-rot))` (src/styles/hero.css) -- the
      // per-letter degree value can't be a Tailwind arbitrary class since
      // it varies per letter/render, not per build.
      style={{ '--hero-letter-rot': `${rotationDeg}deg` } as CSSProperties}
      className={cn('hero-name-letter inline-block', hoverColorClassName)}
    >
      {letter}
    </span>
  )
}

/**
 * The hero (issue #316, restyled to the sample verbatim in mochi/
 * style-match): states the role and name, types a one-shot tagline,
 * shows the stat strip, and replays all 180 real moves of AlphaGo vs. Lee
 * Sedol Game 4 beside it via `GoBoardReplay`.
 *
 * Sample lines 294-328 (`ideas/Portfolio.html`) are the spec for every
 * value below; anything not literally in the sample (spacing, sizing,
 * structure) is not invented here. The left column's `@container` class
 * (Tailwind v4's `container-type: inline-size`) is required by the `<h1>`
 * font-size below it (`min(10.5cqw,64px)`) -- `cqw` units resolve against
 * the nearest container-context ancestor, not the viewport, so without it
 * the heading would size against nothing and fail closed.
 *
 * `GoBoardReplay` owns its own animation timer (scoped to that leaf
 * component, not here) and checks `prefers-reduced-motion` itself, so
 * this component stays a plain, non-re-rendering shell.
 */
export function Hero() {
  const firstLetters = HERO_NAME_FIRST.split('')
  const lastLetters = HERO_NAME_LAST.split('')

  return (
    <Section id={meta.id} headingId="top-heading">
      <div className="grid w-full items-center gap-[clamp(26px,4vw,56px)] [grid-template-columns:repeat(auto-fit,minmax(330px,1fr))]">
        <div className="@container min-w-0">
          <p className="flex items-center gap-[11px] text-[10.5px] tracking-[0.2em] text-dim">
            <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-accent" />
            {HERO_ROLE}
          </p>

          <h1
            id="top-heading"
            aria-label={`${HERO_NAME_FIRST} ${HERO_NAME_LAST}`}
            className="mt-[20px] flex flex-col items-start gap-[0.08em] font-display text-[min(10.5cqw,64px)] leading-[1.14] tracking-[-0.02em] text-fg"
          >
            <span className="flex flex-nowrap">
              {firstLetters.map((letter, index) => (
                <NameLetter
                  key={`${letter}-${index}`}
                  letter={letter}
                  rotationDeg={FIRST_LINE_ROTATIONS[index % FIRST_LINE_ROTATIONS.length]}
                  hoverColorClassName="hover:text-accent-2"
                />
              ))}
            </span>
            <span className="flex flex-nowrap bg-accent pt-0 pr-[0.05em] pb-[0.05em] pl-[0.05em] text-bg">
              {lastLetters.map((letter, index) => (
                <NameLetter
                  key={`${letter}-${index}`}
                  letter={letter}
                  rotationDeg={LAST_LINE_ROTATIONS[index % LAST_LINE_ROTATIONS.length]}
                  hoverColorClassName="hover:text-fg"
                />
              ))}
            </span>
          </h1>

          <HeroTagline
            text={HERO_TAGLINE}
            className="mt-[clamp(20px,3vw,28px)] max-w-[26ch] text-[clamp(17px,2vw,24px)] leading-[1.6] [text-wrap:pretty]"
          />

          <div className="mt-[clamp(24px,3.4vh,34px)] flex flex-wrap gap-px border border-line bg-line">
            <div className="flex-[1_1_160px] bg-panel px-[16px] py-[14px]">
              <div className="text-[9.5px] tracking-[0.18em] text-dim-2">{HERO_STAT_CURRENT_LABEL}</div>
              <div className="mt-[6px] text-[14px] text-fg">{HERO_STAT_CURRENT_VALUE}</div>
            </div>
            <div className="flex-[1_1_160px] bg-panel px-[16px] py-[14px]">
              <div className="text-[9.5px] tracking-[0.18em] text-dim-2">{HERO_STAT_STUDY_LABEL}</div>
              <div className="mt-[6px] text-[14px] text-fg">{HERO_STAT_STUDY_VALUE}</div>
            </div>
            <a
              href="#contact"
              className="flex flex-[1_1_160px] flex-col justify-center gap-[5px] bg-fg px-[16px] py-[14px] text-bg transition-[background-color,color] duration-[180ms] hover:bg-accent hover:text-fg"
            >
              <span className="flex items-center justify-between gap-[10px] text-[11px] tracking-[0.16em]">
                {HERO_CTA_LABEL}
                <span aria-hidden="true">→</span>
              </span>
            </a>
          </div>
        </div>

        <GoBoardReplay />
      </div>
    </Section>
  )
}
