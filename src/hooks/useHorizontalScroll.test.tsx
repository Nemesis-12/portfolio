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
  outerTop: number | (() => number)
  outerHeight: number
  innerScrollWidth: number
}) {
  const outer = document.createElement('section')
  const inner = document.createElement('div')
  const getOuterTop = typeof outerTop === 'function' ? outerTop : () => outerTop

  outer.getBoundingClientRect = vi.fn(() => createRect(getOuterTop(), outerHeight))
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

  it('holds the first card in place through the leading dead zone', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -160,
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

  it('holds the last card in place through the trailing dead zone', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -1440,
      outerHeight: 2400,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 1, tx: -1600 })
  })

  it('moves linearly between the leading and trailing dead zones', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -400,
      outerHeight: 2400,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBeCloseTo(0.1667, 4)
    expect(result.current.tx).toBeCloseTo(-266.67, 2)
  })

  it('returns zero translate when the inner track does not overflow the viewport', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -800,
      outerHeight: 2400,
      innerScrollWidth: 800,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 0.5, tx: 0 })
  })

  it('returns zero progress when the outer container has no vertical scroll range', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -300,
      outerHeight: 600,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 0, tx: 0 })
  })

  it('recalculates translate from the current viewport width on resize', () => {
    setViewport(1000, 800)
    const outerTop = -800

    const { result } = renderHorizontalScrollHook({
      outerTop: () => outerTop,
      outerHeight: 2400,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))
    expect(result.current).toEqual({ progress: 0.5, tx: -800 })

    setViewport(1200, 800)
    act(() => window.dispatchEvent(new Event('resize')))

    expect(result.current).toEqual({ progress: 0.5, tx: -700 })
  })
})
