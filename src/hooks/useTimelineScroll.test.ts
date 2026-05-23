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
})
