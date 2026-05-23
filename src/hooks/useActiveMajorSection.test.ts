import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  ACTIVE_SECTION_SAMPLE_RATIO,
  MAJOR_SECTION_IDS,
  computeActiveMajorSection,
  useActiveMajorSection,
} from './useActiveMajorSection'

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

function mockSection(id: string, top: number, height: number): HTMLElement {
  const section = document.createElement('section')
  section.id = id
  vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(rectWithHeight(top, height))
  document.body.appendChild(section)
  return section
}

describe('computeActiveMajorSection', () => {
  const viewportHeight = 800
  const probeY = viewportHeight * ACTIVE_SECTION_SAMPLE_RATIO

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('samples at 40% of viewport height', () => {
    expect(probeY).toBe(320)
  })

  it('returns the first section when probe is above all sections', () => {
    const sections = {
      home: mockSection('home', 0, viewportHeight),
      projects: mockSection('projects', viewportHeight, viewportHeight * 6),
    }

    expect(
      computeActiveMajorSection(
        MAJOR_SECTION_IDS,
        (id) => sections[id as keyof typeof sections] ?? null,
        viewportHeight,
      ),
    ).toBe('home')
  })

  it('keeps projects active across the full internal scroll range', () => {
    const projectCount = 6
    const projectsHeight = viewportHeight * projectCount
    mockSection('home', -viewportHeight, viewportHeight)
    const projects = mockSection('projects', -projectsHeight / 2, projectsHeight)
    mockSection('skills', projectsHeight / 2, viewportHeight)

    const scrollTops = [
      0,
      -viewportHeight,
      -projectsHeight / 2,
      -(projectsHeight - viewportHeight - 1),
      -(projectsHeight - viewportHeight),
    ]

    for (const top of scrollTops) {
      vi.spyOn(projects, 'getBoundingClientRect').mockReturnValue(
        rectWithHeight(top, projectsHeight),
      )

      expect(
        computeActiveMajorSection(MAJOR_SECTION_IDS, (id) => document.getElementById(id), viewportHeight),
      ).toBe('projects')
    }
  })

  it('keeps timeline active across the full internal scroll range', () => {
    const entryCount = 3
    const timelineHeight = viewportHeight * entryCount
    mockSection('home', -viewportHeight * 2, viewportHeight)
    mockSection('projects', -viewportHeight * 8, viewportHeight * 6)
    mockSection('skills', -viewportHeight, viewportHeight)
    const timeline = mockSection('timeline', -timelineHeight / 2, timelineHeight)
    mockSection('contact', timelineHeight / 2, viewportHeight)

    const scrollTops = [
      0,
      -viewportHeight,
      -timelineHeight / 2,
      -(timelineHeight - viewportHeight - 1),
      -(timelineHeight - viewportHeight),
    ]

    for (const top of scrollTops) {
      vi.spyOn(timeline, 'getBoundingClientRect').mockReturnValue(
        rectWithHeight(top, timelineHeight),
      )

      expect(
        computeActiveMajorSection(MAJOR_SECTION_IDS, (id) => document.getElementById(id), viewportHeight),
      ).toBe('timeline')
    }
  })

  it('does not switch active section based on internal snap anchors or panels', () => {
    const projectsHeight = viewportHeight * 4
    const projects = mockSection('projects', -viewportHeight, projectsHeight)

    const snapAnchor = document.createElement('div')
    snapAnchor.className = 'snap-anchor'
    vi.spyOn(snapAnchor, 'getBoundingClientRect').mockReturnValue(rectWithHeight(100, 1))
    projects.appendChild(snapAnchor)

    const panel = document.createElement('div')
    panel.dataset.timelineTrack = 'true'
    vi.spyOn(panel, 'getBoundingClientRect').mockReturnValue(rectWithHeight(-200, viewportHeight))
    projects.appendChild(panel)

    expect(
      computeActiveMajorSection(MAJOR_SECTION_IDS, (id) => document.getElementById(id), viewportHeight),
    ).toBe('projects')
  })
})

describe('useActiveMajorSection', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('updates active section on scroll using major-section geometry', () => {
    mockSection('home', 0, 800)
    mockSection('projects', 5000, 4800)
    mockSection('skills', 12000, 800)

    const { result } = renderHook(() => useActiveMajorSection())

    expect(result.current).toBe('home')

    act(() => {
      const projects = document.getElementById('projects') as HTMLElement
      vi.spyOn(projects, 'getBoundingClientRect').mockReturnValue(rectWithHeight(-1600, 4800))
      window.dispatchEvent(new Event('scroll'))
    })

    expect(result.current).toBe('projects')
  })

  it('cleans up scroll and resize listeners on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useActiveMajorSection())

    const scrollHandler = addSpy.mock.calls.find(([event]) => event === 'scroll')?.[1]
    const resizeHandler = addSpy.mock.calls.find(([event]) => event === 'resize')?.[1]

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', scrollHandler)
    expect(removeSpy).toHaveBeenCalledWith('resize', resizeHandler)
  })
})
