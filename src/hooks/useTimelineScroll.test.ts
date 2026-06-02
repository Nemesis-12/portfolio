import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import { useTimelineScroll } from './useTimelineScroll'

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  })
}

function createRect(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: window.innerWidth,
    width: window.innerWidth,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

describe('useTimelineScroll', () => {
  it('activates the newest panel and offsets the track at section entry', () => {
    setViewport(1000, 800)

    const outer = document.createElement('section')
    outer.getBoundingClientRect = vi.fn(() => createRect(0, 2400))

    const { result } = renderHook(() => {
      const outerRef = useRef<HTMLElement>(outer)
      return useTimelineScroll(outerRef, 3)
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.activeIndex).toBe(0)
    expect(result.current.active).toEqual([true, false, false])
    expect(result.current.progress).toBe(0)
    expect(result.current.tx).toBe(-2000)
  })

  it('defaults to the newest panel before the section ref attaches', () => {
    setViewport(1000, 800)

    const { result } = renderHook(() => {
      const outerRef = useRef<HTMLElement>(null)
      return useTimelineScroll(outerRef, 3)
    })

    expect(result.current.activeIndex).toBe(0)
    expect(result.current.active).toEqual([true, false, false])
    expect(result.current.progress).toBe(0)
    expect(result.current.tx).toBe(-2000)
  })

  it('selects the middle panel at mid-section scroll progress', () => {
    setViewport(1000, 800)

    const outer = document.createElement('section')
    outer.getBoundingClientRect = vi.fn(() => createRect(-800, 2400))

    const { result } = renderHook(() => {
      const outerRef = useRef<HTMLElement>(outer)
      return useTimelineScroll(outerRef, 3)
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.activeIndex).toBe(1)
    expect(result.current.active).toEqual([false, true, false])
    expect(result.current.progress).toBe(0.5)
    expect(result.current.tx).toBe(-1000)
  })

  it('advances to older panels as the section scrolls', () => {
    setViewport(1000, 800)

    const outer = document.createElement('section')
    outer.getBoundingClientRect = vi.fn(() => createRect(-1600, 2400))

    const { result } = renderHook(() => {
      const outerRef = useRef<HTMLElement>(outer)
      return useTimelineScroll(outerRef, 3)
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.activeIndex).toBe(2)
    expect(result.current.active).toEqual([false, false, true])
    expect(result.current.progress).toBe(1)
    expect(result.current.tx).toEqual(0)
  })

  describe('issue #221 - active panel progression', () => {
    it('maps section scroll progress to active index in newest-to-oldest order', () => {
      setViewport(1000, 800)

      const scenarios = [
        { top: 0, activeIndex: 0, active: [true, false, false], tx: -2000 },
        { top: -800, activeIndex: 1, active: [false, true, false], tx: -1000 },
        { top: -1600, activeIndex: 2, active: [false, false, true], tx: 0 },
      ] as const

      for (const scenario of scenarios) {
        const outer = document.createElement('section')
        outer.getBoundingClientRect = vi.fn(() => createRect(scenario.top, 2400))

        const { result, unmount } = renderHook(() => {
          const outerRef = useRef<HTMLElement>(outer)
          return useTimelineScroll(outerRef, 3)
        })

        act(() => window.dispatchEvent(new Event('scroll')))

        expect(result.current.activeIndex).toBe(scenario.activeIndex)
        expect(result.current.active).toEqual(scenario.active)
        expect(result.current.tx).toBe(scenario.tx)

        unmount()
      }
    })

    it('derives active state from section geometry rather than panel refs', () => {
      setViewport(1000, 800)

      const outer = document.createElement('section')
      outer.getBoundingClientRect = vi.fn(() => createRect(-800, 2400))

      const { result } = renderHook(() => {
        const outerRef = useRef<HTMLElement>(outer)
        return useTimelineScroll(outerRef, 3)
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current.activeIndex).toBe(1)
      expect(result.current.progress).toBe(0.5)
    })
  })
})
