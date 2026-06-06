import { describe, expect, it } from 'vitest'
import { NAV_HEIGHT, SECTION_TOP_GAP, SECTION_TOP_OFFSET } from './layout'

describe('layout tokens', () => {
  it('exports navbar height matching portfolio.css nav chrome', () => {
    expect(NAV_HEIGHT).toBe(56)
  })

  it('derives section top offset from navbar height and gap', () => {
    expect(SECTION_TOP_OFFSET).toBe(NAV_HEIGHT + SECTION_TOP_GAP)
    expect(SECTION_TOP_GAP).toBe(24)
  })
})
