/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))
const portfolioCss = readFileSync(join(srcDir, 'portfolio.css'), 'utf8')
const indexCss = readFileSync(join(srcDir, 'index.css'), 'utf8')

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

  it('defines the shared easing token for transitions', () => {
    expect(portfolioCss).toContain('--ease: cubic-bezier(0.4, 0, 0.2, 1)')
  })

  it('uses mask-position diagonal reveal on pcard-fill from the reference', () => {
    expect(portfolioCss).toContain('mask-image:linear-gradient(135deg')
    expect(portfolioCss).toContain('mask-size:300% 300%')
    expect(portfolioCss).toContain('mask-position:100% 100%')
  })
})
