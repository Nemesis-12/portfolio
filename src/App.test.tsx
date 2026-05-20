import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, render } from '@testing-library/react'
import App from './App'

const sections = ['home', 'projects', 'skills', 'timeline', 'contact'] as const
const sectionIds = [
  'home',
  'skills',
  'timeline',
  'timeline-a3f9d2b',
  'timeline-b7c3e1a',
  'contact',
  'footer',
] as const
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

    expect(nav?.className).toContain('z-40')
    stackSurfaces.forEach((surface) => {
      expect(surface.className).toContain('sticky')
      expect(Number((surface as HTMLElement).style.zIndex)).toBeLessThan(40)
    })
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
    const dotGrid = document.querySelector('[data-testid="hero-dot-grid"]') as HTMLElement
    const homeSection = document.getElementById('home') as HTMLElement

    vi.spyOn(homeSection, 'getBoundingClientRect').mockReturnValue(rectAtTop(-120))

    act(() => {
      frameCallbacks.get(1)?.(0)
      frameCallbacks.delete(1)
    })

    expect(dotGrid.style.transform).toBe('translate3d(0, 36px, 0)')
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
})
