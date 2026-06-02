/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))
const portfolioCss = readFileSync(join(srcDir, 'portfolio.css'), 'utf8')
const indexCss = readFileSync(join(srcDir, 'index.css'), 'utf8')

function blockFor(selector: string) {
  const match = portfolioCss.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`))
  expect(match).not.toBeNull()
  return match?.[1] ?? ''
}

const REFERENCE_COMPONENT_CLASSES = [
  'ls-inner',
  'nav',
  'nav-link',
  'hero-name',
  'hero-grid',
  'btn-fill',
  'hscroll-head',
  'pcard',
  'ptag-fuchsia',
  'bento',
  'tl-org',
  'footer-big',
  'footer-cta',
  'footer-copy',
  'slink',
  'reveal',
  'title-cursor',
]

describe('portfolio.css CSS anchor', () => {
  it('is imported from index.css', () => {
    expect(indexCss).toContain('@import "./portfolio.css"')
  })

  it('uses @layer components', () => {
    expect(portfolioCss).toMatch(/@layer components\s*\{/)
  })

  it.each(REFERENCE_COMPONENT_CLASSES)('defines .%s from the reference', (className) => {
    expect(portfolioCss).toMatch(new RegExp(`\\.${className}[\\s{:,]`))
  })

  it('uses Tailwind v4 token variables instead of reference shorthand tokens', () => {
    expect(portfolioCss).toContain('var(--color-graphite)')
    expect(portfolioCss).toContain('var(--font-display)')
    expect(portfolioCss).not.toMatch(/var\(--graphite\)/)
    expect(portfolioCss).not.toMatch(/var\(--orange\)/)
    expect(portfolioCss).not.toMatch(/var\(--fp\)/)
  })

  it('anchors hero typography from the reference', () => {
    expect(portfolioCss).toMatch(/clamp\(40px,\s*12vw,\s*180px\)/)
    expect(portfolioCss).toMatch(/clamp\(40px,\s*8vw,\s*120px\)/)
  })

  it('anchors the skills bento grid-template-areas layout', () => {
    expect(portfolioCss).toContain('grid-template-areas')
    expect(portfolioCss).toContain('"py py py js js dk"')
  })

  it('keeps React project-card fill hooks alongside reference hover rules', () => {
    expect(portfolioCss).toContain("[data-fill-active='true']")
    expect(portfolioCss).toContain('.pcard:hover .pcard-fill')
    expect(portfolioCss).toContain('.ptag-inverted')
  })

  it('does not prepare project cards for active/neighbor/far scale or opacity suppression', () => {
    const projectCardRule = blockFor('.pcard')

    expect(portfolioCss).not.toMatch(/data-card-state|card-state|neighbor|far/)
    expect(projectCardRule).not.toMatch(/\bscale\(/)
    expect(projectCardRule).not.toMatch(/transition:[^;}]*opacity/)
    expect(projectCardRule).not.toMatch(/will-change:[^;}]*opacity/)
  })

  it('defines the shared easing token for transitions', () => {
    expect(portfolioCss).toContain('--ease: cubic-bezier(0.4, 0, 0.2, 1)')
  })

  it('uses mask-position diagonal reveal on pcard-fill from the reference', () => {
    expect(portfolioCss).toContain('mask-image:linear-gradient(135deg')
    expect(portfolioCss).toContain('mask-size:300% 300%')
    expect(portfolioCss).toContain('mask-position:100% 100%')
  })

  it('anchors loading screen boot sequence from the reference', () => {
    expect(portfolioCss).toMatch(/#ls\{[^}]*background:var\(--color-graphite\)/)
    expect(portfolioCss).toContain('.ls-fill{height:1px;background:var(--color-atomic-tangerine)')
    expect(portfolioCss).toContain('@keyframes lf{to{width:100%}}')
  })

  it('anchors scroll snap targets and snap anchors', () => {
    expect(portfolioCss).toContain('#hero')
    expect(portfolioCss).toContain('#skills')
    expect(portfolioCss).toContain('#contact')
    expect(portfolioCss).toContain('scroll-snap-align: start')
    expect(portfolioCss).toContain('.snap-anchor')
    expect(portfolioCss).toContain('scroll-margin-top: 56px')
  })

  it('anchors navbar floating terminal bar chrome from the reference', () => {
    expect(portfolioCss).toMatch(/\.nav\{[^}]*position:fixed/)
    expect(portfolioCss).toMatch(/\.nav\{[^}]*z-index:100/)
    expect(portfolioCss).toMatch(/\.nav\{[^}]*backdrop-filter:blur\(12px\)/)
    expect(portfolioCss).toContain('.nav-logo{font-family:var(--font-display)')
    expect(portfolioCss).toContain('.nav-link{font-size:14px')
    expect(portfolioCss).toContain('.nav-caret{display:inline-block')
    expect(portfolioCss).toContain('.nav-caret{display:inline-block;color:var(--color-atomic-tangerine);opacity:0')
    expect(portfolioCss).toContain('.nav-link:hover .nav-caret')
    expect(portfolioCss).toContain('.nav-link.active .nav-caret')
    expect(portfolioCss).toContain('.nav-label::after{content')
    expect(portfolioCss).toContain('.nav-link.active .nav-label{color:var(--color-atomic-tangerine)}')
  })

  it('anchors timeline panel typography and terminal caret', () => {
    expect(portfolioCss).toContain('.tl-panel{flex-shrink:0;width:100vw')
    expect(portfolioCss).toContain('.tl-commit{font-size:14px;color:var(--color-atomic-tangerine)')
    expect(portfolioCss).toContain('.caret{display:inline-block')
    expect(portfolioCss).toContain('@keyframes blink-cursor{50%{opacity:0}}')
  })

  it('includes reference mobile breakpoint overrides', () => {
    expect(portfolioCss).toContain('@media (max-width:760px)')
    expect(portfolioCss).toContain('.pcard{width:88vw;height:64vh}')
    expect(portfolioCss).toContain('.bento{grid-template-columns:repeat(2,1fr)')
  })

  it('does not duplicate hero-name-line selector', () => {
    expect(portfolioCss.match(/\.hero-name-line\{/g)).toHaveLength(1)
  })

  it('anchors hero-inner horizontal padding from the reference', () => {
    expect(portfolioCss).toMatch(/\.hero-inner\{[^}]*padding:0 5vw/)
  })

  it('does not anchor global card-deck sticky stack surfaces', () => {
    expect(portfolioCss).not.toContain('CARD-DECK STACK')
    expect(portfolioCss).not.toMatch(
      /\[data-sticky-section="true"\]:not\(\[data-sticky-scroll-host="true"\]\)\{[^}]*position:sticky/,
    )
    expect(portfolioCss).toContain('[data-sticky-viewport="true"]')
  })
})
