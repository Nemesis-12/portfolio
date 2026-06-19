/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { NAV_HEIGHT, SECTION_TOP_GAP, SECTION_TOP_OFFSET } from './data/layout'

const srcDir = dirname(fileURLToPath(import.meta.url))
const portfolioCss = readFileSync(join(srcDir, 'portfolio.css'), 'utf8')
const indexCss = readFileSync(join(srcDir, 'index.css'), 'utf8')

function blockFor(selector: string) {
  const selectorIndex = portfolioCss.indexOf(selector)
  expect(selectorIndex).toBeGreaterThanOrEqual(0)

  const blockStart = portfolioCss.indexOf('{', selectorIndex)
  expect(blockStart).toBeGreaterThanOrEqual(0)

  let depth = 0
  for (let index = blockStart; index < portfolioCss.length; index += 1) {
    const char = portfolioCss[index]
    if (char === '{') {
      depth += 1
    }
    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return portfolioCss.slice(blockStart + 1, index)
      }
    }
  }

  throw new Error(`Missing closing brace for ${selector}`)
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

  it('defines shared section top offset tokens aligned with layout.ts', () => {
    expect(portfolioCss).toContain(`--nav-height: ${NAV_HEIGHT}px`)
    expect(portfolioCss).toContain(`--section-top-gap: ${SECTION_TOP_GAP}px`)
    expect(portfolioCss).toContain('--section-top-offset: calc(var(--nav-height) + var(--section-top-gap))')
    expect(SECTION_TOP_OFFSET).toBe(NAV_HEIGHT + SECTION_TOP_GAP)
    expect(blockFor('#skills{')).toContain('padding:var(--section-top-offset) 5vw 80px')
    expect(blockFor('.hscroll-head')).toContain('padding:var(--section-top-offset) 5vw 18px')
    expect(blockFor('.hero-inner{')).toContain('padding:var(--section-top-offset) 5vw 0')
  })

  it('top-aligns skills and timeline section content', () => {
    expect(blockFor('#skills .hscroll-head')).toContain('padding-top:0')
    expect(blockFor('.tl-panel{')).toContain('justify-content:flex-start')
    expect(blockFor('.tl-panel{')).not.toContain('justify-content:center')
    expect(blockFor('.tl-panel-shell{')).toContain('--timeline-label-gap:32px')
    expect(blockFor('.tl-panel{')).toContain(
      'padding:calc(var(--section-top-gap) + var(--timeline-label-gap)) 8vw 0',
    )
  })

  it('top-aligns hero content instead of vertically centering it', () => {
    // #home must not use justify-content:center — otherwise hero-inner's
    // padding-top: var(--section-top-offset) only nudges the centered block
    // and the visible top offset drifts with viewport height instead of
    // matching the fixed offset Skills/Timeline/Projects use.
    expect(blockFor('#home{')).toContain('justify-content:flex-start')
    expect(blockFor('#home{')).not.toContain('justify-content:center')
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
    expect(portfolioCss).toContain('#home')
    expect(portfolioCss).toContain('#skills')
    expect(portfolioCss).toContain('#contact')
    expect(portfolioCss).toContain('scroll-snap-align: start')
    expect(portfolioCss).toContain('.snap-anchor')
    expect(portfolioCss).toContain('scroll-margin-top: var(--nav-height)')
  })

  it('scopes snap anchor ownership to internal sticky scroll hosts', () => {
    const internalSnapAnchorRule = blockFor('[data-sticky-scroll-host="true"] > .snap-anchor')

    expect(internalSnapAnchorRule).toContain('scroll-snap-align: start')
    expect(internalSnapAnchorRule).toContain('scroll-snap-stop: always')
    expect(portfolioCss).not.toMatch(/(^|\})\s*\.snap-anchor\s*\{[^}]*scroll-snap-align/)
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
    expect(portfolioCss).toContain('.tl-panel{height:calc(100vh - 160px)')
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
    expect(portfolioCss).toMatch(/\.hero-inner\{[^}]*padding:var\(--section-top-offset\) 5vw 0/)
  })

  it('does not anchor global card-deck sticky stack surfaces', () => {
    expect(portfolioCss).not.toContain('CARD-DECK STACK')
    expect(portfolioCss).not.toMatch(
      /\[data-sticky-section="true"\]:not\(\[data-sticky-scroll-host="true"\]\)\{[^}]*position:sticky/,
    )
    expect(portfolioCss).toContain('[data-sticky-viewport="true"]')
  })

  it('avoids scrollbar-induced document overflow from full-width surfaces', () => {
    expect(blockFor('#home{')).toContain('width:100%')
    expect(blockFor('.hscroll')).toContain('width:100%')
    expect(blockFor('#skills{')).toContain('width:100%')
    expect(blockFor('footer')).toContain('width:100%')
    expect(portfolioCss).not.toMatch(/width:100vw/)
  })

  it('clips internal horizontal tracks inside sticky viewports', () => {
    const stickyViewportRule = blockFor('.hscroll-sticky,[data-sticky-viewport="true"]')

    expect(stickyViewportRule).toContain('width:100%')
    expect(stickyViewportRule).toContain('max-width:100%')
    expect(stickyViewportRule).toContain('overflow:hidden')
  })
})
