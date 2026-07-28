import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

/**
 * Composition coverage for issue #312: the skip link must be the very
 * first focusable element in DOM order, before the header's own site
 * mark and nav links, and it must move real focus to the main content.
 */
describe('App composition (#312)', () => {
  it('renders the skip link before the header, so it is first in DOM order', () => {
    render(<App />)

    const skipLink = screen.getByRole('link', { name: /skip to content/i })
    const banner = screen.getByRole('banner')

    // DOCUMENT_POSITION_FOLLOWING is set on the bit that follows -- if the
    // skip link precedes the header, comparing skipLink -> banner reports
    // "following" (banner comes after skip link).
    expect(skipLink.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('is the very first focusable element on the page', () => {
    render(<App />)

    const focusable = document.querySelectorAll<HTMLElement>('a[href], button, [tabindex]')
    expect(focusable.length).toBeGreaterThan(0)
    expect(focusable[0]).toHaveAccessibleName(/skip to content/i)
  })

  it('moves focus to the main content when activated', async () => {
    const user = userEvent.setup()
    render(<App />)

    const skipLink = screen.getByRole('link', { name: /skip to content/i })
    await user.click(skipLink)

    const main = screen.getByRole('main')
    expect(main).toHaveFocus()
  })

  it('renders a fixed header with the site mark and all four nav destinations', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /f\.m/i })).toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: /section/i })
    const links = within(nav).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'Projects',
      'Skills',
      'Education & Experience',
      'Contact',
    ])
  })

  it('gives each nav link an href resolving to a real, rendered section', () => {
    render(<App />)

    const nav = screen.getByRole('navigation', { name: /section/i })
    const links = within(nav).getAllByRole('link')

    for (const link of links) {
      const href = link.getAttribute('href')
      expect(href).toMatch(/^#./)
      const targetId = href!.slice(1)
      expect(document.getElementById(targetId)).not.toBeNull()
      expect(sections.some((section) => section.id === targetId)).toBe(true)
    }
  })
})
