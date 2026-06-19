/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { NAV_HEIGHT } from './data/layout'
import {
  EDGE_SPACER_MAX_VW_FRACTION,
  PROJECT_CARD_GAP,
  PROJECT_CARD_WIDTH,
  PROJECTS_SECTION_PADDING_X,
} from './components/projectsGeometry'

const srcDir = dirname(fileURLToPath(import.meta.url))
const portfolioCss = readFileSync(join(srcDir, 'portfolio.css'), 'utf8')
const indexCss = readFileSync(join(srcDir, 'index.css'), 'utf8')

function blockFor(css: string, selector: string) {
  const selectorIndex = css.indexOf(selector)
  expect(selectorIndex).toBeGreaterThanOrEqual(0)

  const blockStart = css.indexOf('{', selectorIndex)
  expect(blockStart).toBeGreaterThanOrEqual(0)

  let depth = 0
  for (let index = blockStart; index < css.length; index += 1) {
    const char = css[index]
    if (char === '{') {
      depth += 1
    }
    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return css.slice(blockStart + 1, index)
      }
    }
  }

  throw new Error(`Missing closing brace for ${selector}`)
}

describe('portfolio.css geometry token contract', () => {
  it('keeps project card width in sync with PROJECT_CARD_WIDTH', () => {
    const pcardRule = blockFor(portfolioCss, '.pcard')
    expect(pcardRule).toContain(`width:min(${PROJECT_CARD_WIDTH}px`)
  })

  it('keeps proj-track gap in sync with PROJECT_CARD_GAP', () => {
    const projTrackRule = blockFor(portfolioCss, '.proj-track')
    expect(projTrackRule).toContain(`gap:${PROJECT_CARD_GAP}px`)
  })

  it('keeps proj-edge half-card width in sync with PROJECT_CARD_WIDTH / 2', () => {
    const projEdgeRule = blockFor(portfolioCss, '.proj-edge')
    const halfCardWidthPx = PROJECT_CARD_WIDTH / 2
    expect(projEdgeRule).toContain(`min(${halfCardWidthPx}px`)
  })

  it('keeps proj-edge viewport fraction in sync with EDGE_SPACER_MAX_VW_FRACTION', () => {
    const projEdgeRule = blockFor(portfolioCss, '.proj-edge')
    const edgeSpacerVw = Math.round(EDGE_SPACER_MAX_VW_FRACTION * 100)
    expect(projEdgeRule).toContain(`${edgeSpacerVw}vw`)
  })

  it('keeps proj-edge half-viewport term in sync with getEdgeSpacerWidth', () => {
    const projEdgeRule = blockFor(portfolioCss, '.proj-edge')
    expect(projEdgeRule).toContain('50vw')
  })

  it('keeps proj-edge padding+gap offset in sync with PROJECTS_SECTION_PADDING_X + PROJECT_CARD_GAP', () => {
    const projEdgeRule = blockFor(portfolioCss, '.proj-edge')
    expect(projEdgeRule).toContain(`${PROJECTS_SECTION_PADDING_X + PROJECT_CARD_GAP}px`)
  })

  it('keeps nav height in sync with NAV_HEIGHT', () => {
    const navRule = blockFor(portfolioCss, '.nav')
    expect(navRule).toContain(`height:${NAV_HEIGHT}px`)
  })

  it('keeps snap-anchor scroll margin in sync with NAV_HEIGHT', () => {
    const snapAnchorRule = blockFor(portfolioCss, '.snap-anchor')
    expect(snapAnchorRule).toContain(`scroll-margin-top: ${NAV_HEIGHT}px`)
  })

  it('keeps html scroll padding in sync with NAV_HEIGHT', () => {
    const htmlMatch = indexCss.match(/html\s*\{([^}]*)\}/)
    expect(htmlMatch).not.toBeNull()
    expect(htmlMatch?.[1]).toContain(`scroll-padding-top: ${NAV_HEIGHT}px;`)
  })
})
