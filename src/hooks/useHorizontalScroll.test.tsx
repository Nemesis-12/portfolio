import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import { useHorizontalScroll } from './useHorizontalScroll'

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

function renderHorizontalScrollHook({
  outerTop,
  outerHeight,
  innerScrollWidth,
}: {
  outerTop: number
  outerHeight: number
  innerScrollWidth: number
}) {
  const outer = document.createElement('section')
  const inner = document.createElement('div')

  outer.getBoundingClientRect = vi.fn(() => createRect(outerTop, outerHeight))
  Object.defineProperty(inner, 'scrollWidth', {
    configurable: true,
    value: innerScrollWidth,
  })

  return renderHook(() => {
    const outerRef = useRef<HTMLElement>(outer)
    const innerRef = useRef<HTMLElement>(inner)

    return useHorizontalScroll(outerRef, innerRef)
  })
}

describe('useHorizontalScroll', () => {
  it('returns 0.5 progress and half the horizontal offset midway through the section', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -800,
      outerHeight: 2400,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(0.5)
    expect(result.current.tx).toBe(-800)
  })

  it('returns zero progress and translate before the outer container enters the viewport', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: 800,
      outerHeight: 2400,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 0, tx: 0 })
  })

  it('returns full progress and max translate after the outer container scrolls fully past', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -1600,
      outerHeight: 2400,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 1, tx: -1600 })
  })
})
