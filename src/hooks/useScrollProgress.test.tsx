import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import { useScrollProgress } from './useScrollProgress'

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

function renderScrollProgressHook({
  outerTop,
  outerHeight,
  getScrollRangePx,
}: {
  outerTop: number | (() => number)
  outerHeight: number
  getScrollRangePx?: (geometry: {
    sectionTop: number
    sectionHeight: number
    viewportHeight: number
  }) => number
}) {
  const outer = document.createElement('section')
  const getOuterTop = typeof outerTop === 'function' ? outerTop : () => outerTop

  outer.getBoundingClientRect = vi.fn(() => createRect(getOuterTop(), outerHeight))

  return renderHook(() => {
    const outerRef = useRef<HTMLElement>(outer)
    return useScrollProgress(outerRef, getScrollRangePx ? { getScrollRangePx } : undefined)
  })
}

describe('useScrollProgress', () => {
  it('returns 0 progress at section entry', () => {
    setViewport(1000, 800)

    const { result } = renderScrollProgressHook({
      outerTop: 0,
      outerHeight: 1600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(0)
  })

  it('returns 0.5 progress midway through the section', () => {
    setViewport(1000, 800)

    const { result } = renderScrollProgressHook({
      outerTop: -400,
      outerHeight: 1600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(0.5)
  })

  it('returns 1 progress after the section scrolls fully past', () => {
    setViewport(1000, 800)

    const { result } = renderScrollProgressHook({
      outerTop: -800,
      outerHeight: 1600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(1)
  })

  it('removes scroll and resize listeners on unmount', () => {
    setViewport(1000, 800)
    const removeScrollSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderScrollProgressHook({
      outerTop: 0,
      outerHeight: 1600,
    })

    unmount()

    expect(removeScrollSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeScrollSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    removeScrollSpy.mockRestore()
  })

  it('uses a custom scroll range callback when provided', () => {
    setViewport(1000, 800)

    const { result } = renderScrollProgressHook({
      outerTop: -400,
      outerHeight: 1600,
      getScrollRangePx: () => 800,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(0.5)
  })
})
