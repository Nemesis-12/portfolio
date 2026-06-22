import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { act, render } from '@testing-library/react'
import App from './App'
import {
  BOOT_DURATION,
  FADE_OUT_DURATION,
} from './components/LoadingScreen.constants'
import { FIRST_NAME } from './components/HeroSection.constants'
import { SECTIONS, type SectionId } from './data/sections'

const appSourcePath = path.resolve(__dirname, './App.tsx')
const appSource = readFileSync(appSourcePath, 'utf-8')

const sectionIds = SECTIONS.map((section) => section.id)
const sections = sectionIds satisfies readonly SectionId[]
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

function getMajorSectionElements() {
  return sectionIds
    .map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => section instanceof HTMLElement)
}

describe('App shell', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each(sections)('renders %s section', (id) => {
    render(<App />)
    const section = document.getElementById(id)
    expect(section).toBeInTheDocument()
    expect(section?.tagName.toLowerCase()).toBe(id === 'contact' ? 'footer' : 'section')
  })

  it('renders sections in the correct order', () => {
    render(<App />)
    expect(getMajorSectionElements().map((section) => section.id)).toEqual([...sectionIds])
  })

  it('major sections span the full browser width', () => {
    render(<App />)
    getMajorSectionElements().forEach((surface) => {
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

  it('keeps the navbar above page sections without card-deck z-index stacking', () => {
    render(<App />)
    const nav = document.querySelector('nav')

    expect(nav?.className).toContain('nav')

    const projects = document.getElementById('projects')
    expect(projects?.className).toContain('relative')
    expect(projects?.querySelector('[data-sticky-viewport="true"]')).toBeInTheDocument()

    getMajorSectionElements().forEach((surface) => {
      expect(surface).not.toHaveAttribute('data-sticky-section')
      expect((surface as HTMLElement).style.zIndex).toBe('')
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

    expect(lineGrid.style.transform).toBe('translate3d(0, 30px, 0)')
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true })

    // Other sections (ProjectsSection, TimelineSection) also register their own
    // scroll-driven hooks, so look up the parallax listener specifically rather
    // than assuming it's the first 'scroll' registration, and invoke it directly
    // instead of dispatching a global scroll event — this isolates the parallax
    // hook's own RAF-batching behavior from every other scroll listener mounted
    // by the rest of the app.
    const scrollHandler = addEventListenerSpy.mock.calls.find(
      ([eventName, handler]) => eventName === 'scroll' && (handler as Function).name === 'requestParallaxUpdate',
    )?.[1] as EventListener

    const rafCallsBeforeScroll = requestAnimationFrameSpy.mock.calls.length
    act(() => {
      scrollHandler(new Event('scroll'))
      scrollHandler(new Event('scroll'))
    })

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(rafCallsBeforeScroll + 1)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', scrollHandler)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(2)
  })

  it('uses section geometry for footer parallax layers', () => {
    const frameCallbacks = new Map<number, FrameRequestCallback>()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCallbacks.set(1, callback)
      return 1
    })

    render(<App />)
    const footer = document.querySelector('#contact') as HTMLElement
    const footerBig = document.querySelector('#contact .footer-big') as HTMLElement

    vi.spyOn(footer, 'getBoundingClientRect').mockReturnValue(rectAtTop(-80))
    vi.spyOn(footerBig, 'getBoundingClientRect').mockReturnValue(rectAtTop(-20))

    act(() => {
      frameCallbacks.get(1)?.(0)
    })

    expect(footerBig.style.transform).toBe('translate3d(0, -3.2px, 0)')
  })

  it('uses element geometry for parallax layers outside major sections', () => {
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

  describe('issue #214 - global scroll shell regression', () => {
    const majorSectionIds = sectionIds

    it('does not mount a global sticky section stack', () => {
      render(<App />)

      expect(document.querySelectorAll('[data-sticky-section="true"]')).toHaveLength(0)
    })

    it.each(majorSectionIds)('%s flows as a normal major section without card-deck depth', (id) => {
      render(<App />)
      const section = document.getElementById(id) as HTMLElement

      expect(section).toBeInTheDocument()
      expect(section).not.toHaveAttribute('data-sticky-section')
      expect(section).not.toHaveClass('sticky', 'top-0')
      expect(section.style.transform).toBe('')
      expect(section.style.opacity).toBe('')
      expect(section.style.zIndex).toBe('')
    })

    it('timeline is one major section with an internal horizontal track', () => {
      render(<App />)

      const timeline = document.getElementById('timeline')
      expect(timeline).toBeInTheDocument()
      expect(document.getElementById('timeline-a3f9d2b')).not.toBeInTheDocument()
      expect(timeline?.querySelector('[data-timeline-track="true"]')).toBeInTheDocument()
      expect(timeline?.querySelectorAll('.snap-anchor')).toHaveLength(4)
    })

    it('projects outer scroll host keeps an internal sticky viewport only', () => {
      render(<App />)

      const projects = document.getElementById('projects')
      const stickyViewport = projects?.querySelector('[data-sticky-viewport="true"]')

      expect(projects).toHaveAttribute('data-sticky-scroll-host', 'true')
      expect(projects).not.toHaveAttribute('data-sticky-section')
      expect(stickyViewport).toHaveClass('hscroll-sticky')
    })

    it('does not scale or dim outgoing sections on scroll', async () => {
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

      expect(home.style.transform).toBe('')
      expect(home.style.opacity).toBe('')
      expect(home.style.filter).toBe('')
    })

    it('keeps projects carousel translateX independent from section transforms', async () => {
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

      expect(projects.style.transform).toBe('')
      expect(projects.style.transform).not.toContain('translateX')
      expect(carouselTrack.style.transform).toContain('translateX')
    })
  })

  describe('issue #283 - loading screen vanilla CSS boot animation', () => {
    it('renders the loading screen via plain conditional rendering, not AnimatePresence', () => {
      expect(appSource).not.toMatch(/framer-motion/)
      expect(appSource).not.toMatch(/AnimatePresence/)
      expect(appSource).toMatch(/\{loading\s*&&\s*<LoadingScreen/)
    })

    it('still renders the loading screen on mount', () => {
      render(<App />)
      expect(document.getElementById('ls')).toBeInTheDocument()
    })

    it('still renders Analytics and SpeedInsights alongside the loading screen', () => {
      expect(appSource).toMatch(/@vercel\/analytics/)
      expect(appSource).toMatch(/@vercel\/speed-insights/)
    })
  })

  describe('issue #216 - loader-to-hero intro handoff', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not advance hero type-in while the loading screen is visible', () => {
      render(<App />)

      expect(document.getElementById('ls')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(BOOT_DURATION + FADE_OUT_DURATION - 1)
      })

      const nameLines = document.getElementById('home')?.querySelectorAll('.hero-name-line')
      expect(nameLines?.[0]?.textContent).toBe('')
      expect(nameLines?.[1]?.textContent).toBe('')
    })

    it('starts hero intro from the beginning after loading completes', async () => {
      render(<App />)

      await act(async () => {
        vi.advanceTimersByTime(BOOT_DURATION)
      })
      await act(async () => {
        vi.advanceTimersByTime(FADE_OUT_DURATION)
      })

      expect(document.getElementById('ls')).not.toBeInTheDocument()

      const nameLines = document.getElementById('home')?.querySelectorAll('.hero-name-line')
      expect(nameLines?.[0]?.textContent).toBe('')

      // FARHAN only starts once the '// PORTFOLIO_INIT' label has finished
      // typing (speed=28/char) and its own 200ms stagger delay has elapsed
      // (see HeroSection.tsx's Typewriter delay={200} on FIRST_NAME, matching
      // ideas/Portfolio.html's Hero intro sequencing) — advance past both
      // before checking for FARHAN's first character. Typewriter shows its
      // first character immediately once its delay elapses, so no extra
      // NAME_SPEED tick is needed here.
      const INIT_TEXT_LENGTH = '// PORTFOLIO_INIT'.length
      const INIT_SPEED = 28
      const FIRST_NAME_DELAY = 200
      act(() => {
        vi.advanceTimersByTime(INIT_TEXT_LENGTH * INIT_SPEED)
      })
      act(() => {
        vi.advanceTimersByTime(FIRST_NAME_DELAY)
      })

      expect(nameLines?.[0]?.textContent).toBe(FIRST_NAME.slice(0, 1))
      expect(nameLines?.[1]?.textContent).toBe('')
    })
  })
})
