import { describe, it, expect } from 'vitest'
import { SECTIONS } from './sections'
import { MAJOR_SECTION_IDS } from '../hooks/useActiveMajorSection'

describe('sections registry', () => {
  it('keeps MAJOR_SECTION_IDS derived from SECTIONS', () => {
    expect(MAJOR_SECTION_IDS).toEqual(SECTIONS.map((section) => section.id))
  })

  it('defines unique section ids in scroll order', () => {
    const ids = SECTIONS.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThan(0)
  })

  it('defines nav labels and hash hrefs for every section', () => {
    for (const { id, navLabel } of SECTIONS) {
      expect(navLabel.length).toBeGreaterThan(0)
      expect(`#${id}`).toMatch(/^#[a-z]+$/)
    }
  })
})
