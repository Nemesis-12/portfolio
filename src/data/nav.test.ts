import { describe, expect, it } from 'vitest'
import { navItems } from './nav'
import { sections } from './sections'

/**
 * Seam 3 (data integrity) coverage for issue #312: nav targets must
 * always resolve to a real, currently-rendered section. This is the guard
 * against the nav list and the section shell drifting apart.
 */
describe('navItems', () => {
  it('lists exactly the four spec\'d destinations, in order', () => {
    expect(navItems.map((item) => item.id)).toEqual(['projects', 'skills', 'path', 'contact'])
  })

  it('excludes the hero and the second projects screen, which are scroll-only', () => {
    const ids = navItems.map((item) => item.id)
    expect(ids).not.toContain('top')
    expect(ids).not.toContain('more')
  })

  it('resolves every nav target to a real section id', () => {
    const sectionIds = new Set(sections.map((section) => section.id))
    for (const item of navItems) {
      expect(sectionIds.has(item.id)).toBe(true)
    }
  })

  it('gives every nav item a non-empty label', () => {
    for (const item of navItems) {
      expect(item.label.trim().length).toBeGreaterThan(0)
    }
  })
})
