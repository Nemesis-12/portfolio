/**
 * Maintainability smoke path — first check for cross-module regressions.
 *
 * Verifies the refactored contracts work together end-to-end: the SECTIONS
 * registry drives nav rendering and active-section detection, and the shared
 * useScrollProgress primitive reports correct progression through a sticky host.
 * Issue #261.
 */

import { createElement, useRef } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, renderHook, act, cleanup } from '@testing-library/react'
import { SECTIONS } from './data/sections'
import Navbar from './components/Navbar'
import {
  MAJOR_SECTION_IDS,
  computeActiveMajorSection,
} from './hooks/useActiveMajorSection'
import { useScrollProgress } from './hooks/useScrollProgress'

const VIEWPORT_HEIGHT = 800
const SECTION_IDS = SECTIONS.map((section) => section.id)
const PROGRESS_TOLERANCE = 0.01

function rectWithHeight(top: number, height: number): DOMRect {
  return {
    top,
    right: 1000,
    bottom: top + height,
    left: 0,
    width: 1000,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

function setViewport(height: number) {
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  })
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: 1000,
  })
}

function mockSectionElement(id: string, top: number, height: number): HTMLElement {
  const tag = id === 'contact' ? 'footer' : 'section'
  const element = document.createElement(tag)
  element.id = id
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rectWithHeight(top, height))
  document.body.appendChild(element)
  return element
}

function setupActiveSectionGeometry(targetId: string): (id: string) => HTMLElement | null {
  const elements = new Map<string, HTMLElement>()
  const targetIndex = SECTIONS.findIndex((section) => section.id === targetId)

  for (const [index, section] of SECTIONS.entries()) {
    let top: number
    const height = VIEWPORT_HEIGHT

    if (section.id === targetId) {
      top = 0
    } else if (index < targetIndex) {
      top = -5000 - index * 1000
    } else {
      top = 5000 + index * 1000
    }

    elements.set(section.id, mockSectionElement(section.id, top, height))
  }

  return (id) => elements.get(id) ?? null
}

describe('maintainability smoke path (issue #261)', () => {
  beforeEach(() => {
    setViewport(VIEWPORT_HEIGHT)
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('wires section registry, navigation, active-section, and scroll progression', () => {
    // Contract 1 — Section registry → nav rendering
    render(createElement(Navbar))
    const nav = screen.getByRole('navigation')
    const links = within(nav).getAllByRole('link')

    for (const section of SECTIONS) {
      const link = links.find((candidate) => candidate.getAttribute('href') === `#${section.id}`)
      expect(link, `nav link for ${section.id}`).toBeDefined()
      expect(within(link!).getByText(section.navLabel)).toBeInTheDocument()
    }

    const sectionLinks = links.filter((link) =>
      SECTIONS.some((section) => link.getAttribute('href') === `#${section.id}`),
    )
    expect(sectionLinks).toHaveLength(SECTIONS.length)

    // Contract 2 — Section registry → active-section
    expect(SECTION_IDS).toEqual(MAJOR_SECTION_IDS)

    for (const targetSection of SECTIONS) {
      document.body.innerHTML = ''
      vi.restoreAllMocks()

      const getElement = setupActiveSectionGeometry(targetSection.id)

      expect(
        computeActiveMajorSection(SECTION_IDS, getElement, VIEWPORT_HEIGHT),
        `active section for ${targetSection.id}`,
      ).toBe(targetSection.id)
    }

    // Contract 3 — Scroll primitive → progression
    document.body.innerHTML = ''
    vi.restoreAllMocks()

    const outer = document.createElement('section')
    const outerHeight = 1600
    outer.getBoundingClientRect = vi.fn(() => rectWithHeight(-400, outerHeight))

    const { result } = renderHook(() => {
      const outerRef = useRef<HTMLElement>(outer)
      return useScrollProgress(outerRef)
    })

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.progress).toBeGreaterThanOrEqual(0.5 - PROGRESS_TOLERANCE)
    expect(result.current.progress).toBeLessThanOrEqual(0.5 + PROGRESS_TOLERANCE)
  })

  it('propagates SECTIONS registry changes to rendered nav without Navbar changes', async () => {
    vi.resetModules()
    vi.doMock('./data/sections', () => ({
      SECTIONS: [
        { id: 'home', navLabel: 'HOME' },
        { id: 'about', navLabel: 'ABOUT US' },
      ] as const,
    }))

    try {
      const { default: NavbarWithRegistry } = await import('./components/Navbar')

      render(createElement(NavbarWithRegistry))

      const nav = screen.getByRole('navigation')
      const links = within(nav).getAllByRole('link')
      const sectionLinks = links.filter((link) => {
        const href = link.getAttribute('href') ?? ''
        return href.startsWith('#') && href !== '#'
      })

      expect(sectionLinks).toHaveLength(2)
      expect(within(nav).getByText('ABOUT US')).toBeInTheDocument()
      expect(links.some((link) => link.getAttribute('href') === '#about')).toBe(true)
      expect(links.filter((link) => link.getAttribute('href') === '#home')).toHaveLength(1)
      expect(within(nav).queryByText('PROJECTS')).not.toBeInTheDocument()
      expect(within(nav).queryByText('TIMELINE')).not.toBeInTheDocument()
    } finally {
      vi.doUnmock('./data/sections')
      vi.resetModules()
    }
  })
})
