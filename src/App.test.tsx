import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { sections } from '@/data/sections'

/**
 * Seam 1 (application root) coverage for issue #311: the six sections
 * render, in the specified order, each identifiable and scroll-targetable
 * by id. Viewport fit and scroll-snap behaviour cannot be asserted here --
 * jsdom has no layout engine -- and are verified manually (see PR/spec).
 */
describe('App', () => {
  it('renders exactly the six sections, in the specified order', () => {
    render(<App />)

    const regions = screen.getAllByRole('region')
    expect(regions).toHaveLength(sections.length)

    const renderedIds = regions.map((region) => region.id)
    expect(renderedIds).toEqual(sections.map((section) => section.id))
  })

  it('gives every section its documented id and accessible name, in DOM order', () => {
    render(<App />)

    for (const section of sections) {
      const region = document.getElementById(section.id)
      expect(region).not.toBeNull()
      expect(region).toHaveAttribute('aria-label', section.label)
    }
  })

  it('renders each section as scroll-targetable (a real element with its id, reachable via #id)', () => {
    render(<App />)

    for (const section of sections) {
      expect(document.querySelector(`#${section.id}`)).toBeInTheDocument()
    }
  })
})
