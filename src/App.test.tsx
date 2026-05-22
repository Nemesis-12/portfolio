import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, render } from '@testing-library/react'
import App from './App'

const sections = ['home', 'projects', 'skills', 'timeline', 'contact'] as const
const sectionIds = [
  'home',
  'projects',
  'skills',
  'timeline',
  'timeline-a3f9d2b',
  'timeline-b7c3e1a',
  'contact',
  'footer',
] as const
const timelinePanelIds = ['timeline', 'timeline-a3f9d2b', 'timeline-b7c3e1a']
const shellConstraintClasses = ['container', 'max-w-7xl', 'mx-auto'] as const

function expectNoShellConstraint(element: Element) {
  shellConstraintClasses.forEach((className) => {
    expect(element.classList).not.toContain(className)
  })
}

function rectAtTop(top: number): DOMRect {
  return {
    top,
    right: 0,
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

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

describe('App shell', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each(sections)('renders %s section', (id) => {
    render(<App />)
    const section = document.getElementById(id)
    expect(section).toBeInTheDocument()
    expect(section?.tagName.toLowerCase()).toBe('section')
  })

  it('renders sections in the correct order', () => {
    render(<App />)
    const renderedStackIds = document.querySelectorAll('[data-sticky-section="true"][id]')
    expect(Array.from(renderedStackIds).map((s) => s.id)).toEqual([...sectionIds])
  })

  it('stack surfaces span the full browser width', () => {
    render(<App />)
    const stackSurfaces = document.querySelectorAll('[data-sticky-section="true"][id]')
    stackSurfaces.forEach((surface) => {
      expectNoShellConstraint(surface)
      expect(surface.className).toContain('min-h-screen')
    })
  })

  it('main element has no centered shell constraint', () => {
    render(<App />)
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).not.toHaveAttribute('class')
    expectNoShellConstraint(main as Element)
  })

  it('keeps the navbar above the sticky section stack', () => {
    render(<App />)
    const nav = document.querySelector('nav')
    const stackSurfaces = document.querySelectorAll('[data-sticky-section="true"][id]')

    expect(nav?.className).toContain('nav')
    stackSurfaces.forEach((surface) => {
      if (surface.id === 'projects') {
        expect(surface.className).toContain('relative')
        expect(surface.querySelector('[data-sticky-viewport="true"]')).toBeInTheDocument()
      } else {
        expect(surface.className).toContain('sticky')
      }
      expect(Number((surface as HTMLElement).style.zIndex)).toBeLessThan(100)
    })
  })

  it('navbar does not force a narrow page shell', () => {
    render(<App />)
    const nav = document.querySelector('nav')
    expect(nav).toBeInTheDocument()
    expect(nav!.className).toContain('nav')
    expect(nav!.className).not.toContain('max-w-7xl')
    expect(nav!.className).not.toContain('mx-auto')
    expect(nav!.querySelector('.nav-logo')).toBeInTheDocument()
  })

  it('initializes one RAF-batched parallax scroll listener and cleans it up', () => {
    let nextFrameId = 1
    const frameCallbacks = new Map<number, FrameRequestCallback>()
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        const frameId = nextFrameId
        nextFrameId += 1
        frameCallbacks.set(frameId, callback)
        return frameId
      })
    const cancelAnimationFrameSpy = vi
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation((frameId) => {
        frameCallbacks.delete(frameId)
      })
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(<App />)
    const lineGrid = document.querySelector('[data-testid="hero-grid"]') as HTMLElement
    const homeSection = document.getElementById('home') as HTMLElement

    vi.spyOn(homeSection, 'getBoundingClientRect').mockReturnValue(rectAtTop(-120))

    act(() => {
      frameCallbacks.get(1)?.(0)
      frameCallbacks.delete(1)
    })

    expect(lineGrid.style.transform).toBe('translate3d(0, 36px, 0)')
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true })

    const scrollHandler = addEventListenerSpy.mock.calls.find(([eventName]) => eventName === 'scroll')?.[1]
    act(() => {
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
    })

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(2)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', scrollHandler)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(2)
  })

  it('uses stack surface geometry for footer parallax layers', () => {
    const frameCallbacks = new Map<number, FrameRequestCallback>()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.set(1, callback)
      return 1
    })

    render(<App />)
    const footer = document.querySelector('footer') as HTMLElement
    const footerText = document.querySelector('footer [data-parallax]') as HTMLElement

    vi.spyOn(footer, 'getBoundingClientRect').mockReturnValue(rectAtTop(-80))
    vi.spyOn(footerText, 'getBoundingClientRect').mockReturnValue(rectAtTop(-20))

    act(() => {
      frameCallbacks.get(1)?.(0)
    })

    expect(footerText.style.transform).toBe('translate3d(0, 40px, 0)')
  })

  it('uses element geometry for parallax layers outside stack surfaces', () => {
    const frameCallbacks = new Map<number, FrameRequestCallback>()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.set(1, callback)
      return 1
    })

    const orphanLayer = document.createElement('div')
    orphanLayer.dataset.parallax = ''
    orphanLayer.dataset.parallaxFactor = '0.5'
    document.body.append(orphanLayer)

    vi.spyOn(orphanLayer, 'getBoundingClientRect').mockReturnValue(rectAtTop(-80))

    try {
      render(<App />)

      act(() => {
        frameCallbacks.get(1)?.(0)
      })

      expect(orphanLayer.style.transform).toBe('translate3d(0, 40px, 0)')
    } finally {
      orphanLayer.remove()
    }
  })

  it('treats missing and invalid parallax factors as zero movement', () => {
    const frameCallbacks = new Map<number, FrameRequestCallback>()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.set(1, callback)
      return 1
    })

    render(<App />)
    const missingFactorLayer = document.createElement('div')
    const invalidFactorLayer = document.createElement('div')
    missingFactorLayer.dataset.parallax = ''
    invalidFactorLayer.dataset.parallax = ''
    invalidFactorLayer.dataset.parallaxFactor = 'not-a-number'
    document.body.append(missingFactorLayer, invalidFactorLayer)

    vi.spyOn(missingFactorLayer, 'getBoundingClientRect').mockReturnValue(rectAtTop(-120))
    vi.spyOn(invalidFactorLayer, 'getBoundingClientRect').mockReturnValue(rectAtTop(-120))

    try {
      act(() => {
        frameCallbacks.get(1)?.(0)
      })

      expect(missingFactorLayer.style.transform).toBe('translate3d(0, 0px, 0)')
      expect(invalidFactorLayer.style.transform).toBe('translate3d(0, 0px, 0)')
    } finally {
      missingFactorLayer.remove()
      invalidFactorLayer.remove()
    }
  })

  describe('issue #157 - Timeline sticky panel scroll contract', () => {
    it('timeline panels are part of the global sticky section stack', () => {
      render(<App />)

      const allStickySections = document.querySelectorAll('[data-sticky-section="true"]')
      const timelinePanels = Array.from(allStickySections).filter((s) =>
        timelinePanelIds.includes(s.id)
      )

      expect(timelinePanels.length).toBe(3)
    })

    it('timeline panels have z-index below navbar', () => {
      render(<App />)

      const timelinePanels = document.querySelectorAll('[data-sticky-section="true"]')
      const filtered = Array.from(timelinePanels).filter((s) =>
        timelinePanelIds.includes(s.id)
      )

      filtered.forEach((panel) => {
        const zIndex = Number((panel as HTMLElement).style.zIndex)
        expect(zIndex).toBeLessThan(100)
        expect(zIndex).toBeGreaterThan(0)
      })
    })

    it('timeline panels do not use horizontal scroll behavior', () => {
      render(<App />)

      const timelinePanels = document.querySelectorAll('[data-sticky-section="true"]')
      const filtered = Array.from(timelinePanels).filter((s) =>
        timelinePanelIds.includes(s.id)
      )

      filtered.forEach((panel) => {
        const style = (panel as HTMLElement).style
        expect(style.transform).not.toContain('translateX')
      })
    })

    it('timeline panels render in newest-first order in the global stack', () => {
      render(<App />)

      const allStickySections = document.querySelectorAll('[data-sticky-section="true"][id]')
      const ids = Array.from(allStickySections).map((s) => s.id)

      const timelineIndex = ids.indexOf('timeline')
      const msIndex = ids.indexOf('timeline-a3f9d2b')
      const bsIndex = ids.indexOf('timeline-b7c3e1a')

      expect(timelineIndex).toBeLessThan(msIndex)
      expect(msIndex).toBeLessThan(bsIndex)
    })

    it('each timeline panel occupies full viewport height in the stack', () => {
      render(<App />)

      const allStickySections = document.querySelectorAll('[data-sticky-section="true"]')
      const timelinePanels = Array.from(allStickySections).filter((s) =>
        timelinePanelIds.includes(s.id)
      )

      timelinePanels.forEach((panel) => {
        expect(panel).toHaveClass('min-h-screen')
        expect(panel).toHaveClass('sticky')
        expect(panel).toHaveClass('top-0')
      })
    })
  })

  describe('issue #187 - card-deck stacking across all sections', () => {
    const stickyMajorSectionIds = ['home', 'skills', 'contact'] as const
    const timelinePanelIds = ['timeline', 'timeline-a3f9d2b', 'timeline-b7c3e1a'] as const

    it.each([...stickyMajorSectionIds, ...timelinePanelIds])(
      '%s carries sticky top-0 positioning',
      (id) => {
        render(<App />)
        const section = document.getElementById(id)

        expect(section).toBeInTheDocument()
        expect(section).toHaveClass('sticky')
        expect(section).toHaveClass('top-0')
      },
    )

    it('projects outer scroll host pins the carousel viewport at top: 0 independently', () => {
      render(<App />)

      const projects = document.getElementById('projects')
      const stickyViewport = projects?.querySelector('[data-sticky-viewport="true"]')

      expect(projects).toHaveAttribute('data-sticky-scroll-host', 'true')
      expect(stickyViewport).toHaveClass('hscroll-sticky')
    })

    it('stack surfaces stay sharp with no blur or border-radius styling', () => {
      render(<App />)

      document.querySelectorAll('[data-sticky-section="true"]').forEach((surface) => {
        const element = surface as HTMLElement

        expect(element.className).not.toMatch(/blur|rounded/)
        expect(element.style.filter).toBe('')
        expect(element.style.borderRadius).toBe('')
      })
    })

    it('scales and dims outgoing sections as the next section enters', async () => {
      render(<App />)

      const home = document.getElementById('home') as HTMLElement
      const projects = document.getElementById('projects') as HTMLElement

      vi.spyOn(projects, 'getBoundingClientRect').mockReturnValue(rectAtTop(400))
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 800,
      })

      await act(async () => {
        window.dispatchEvent(new Event('scroll'))
      })

      expect(home.style.transform).toBe('scale(0.975)')
      expect(home.style.opacity).toBe('0.875')
      expect(home.style.filter).toBe('')
    })

    it('clamps outgoing section depth once the next section passes the viewport top', async () => {
      render(<App />)

      const home = document.getElementById('home') as HTMLElement
      const projects = document.getElementById('projects') as HTMLElement

      vi.spyOn(projects, 'getBoundingClientRect').mockReturnValue(rectAtTop(-200))
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 800,
      })

      await act(async () => {
        window.dispatchEvent(new Event('scroll'))
      })

      expect(home.style.transform).toBe('scale(0.95)')
      expect(home.style.opacity).toBe('0.75')
    })

    it('keeps projects carousel translateX independent from card-deck depth transforms', async () => {
      render(<App />)

      const projects = document.getElementById('projects') as HTMLElement
      const skills = document.getElementById('skills') as HTMLElement
      const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement

      vi.spyOn(skills, 'getBoundingClientRect').mockReturnValue(rectAtTop(400))
      vi.spyOn(projects, 'getBoundingClientRect').mockReturnValue(rectWithHeight(-800, 3200))
      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 800,
      })
      Object.defineProperty(carouselTrack, 'scrollWidth', {
        configurable: true,
        value: 2000,
      })
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1000,
      })

      await act(async () => {
        window.dispatchEvent(new Event('scroll'))
      })

      expect(projects.style.transform).toBe('scale(0.975)')
      expect(projects.style.transform).not.toContain('translateX')
      expect(carouselTrack.style.transform).toContain('translateX')
    })
  })
})
