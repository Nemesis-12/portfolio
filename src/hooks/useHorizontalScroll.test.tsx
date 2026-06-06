import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import { getEdgeSpacerWidth, PROJECT_CARD_GAP } from '../components/projectsGeometry'
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

function cardCenterX(
  tx: number,
  cardIndex: number,
  cardWidth: number,
  cardGap: number,
  edgeWidth: number,
) {
  return tx + edgeWidth + cardIndex * (cardWidth + cardGap) + cardWidth / 2
}

describe('useHorizontalScroll', () => {
  it('returns 0.5 progress and half the horizontal offset midway through the section', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -400,
      outerHeight: 1600,
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
      outerHeight: 1600,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 0, tx: 0 })
  })

  it('maps scroll position linearly from section start to end', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -160,
      outerHeight: 1600,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBeCloseTo(0.2, 4)
    expect(result.current.tx).toBeCloseTo(-320, 0)
  })

  it('returns full progress and max translate after the outer container scrolls fully past', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -800,
      outerHeight: 1600,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 1, tx: -1600 })
  })

  it('clamps progress to 1 when scrolled past the section end', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -1200,
      outerHeight: 1600,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 1, tx: -1600 })
  })

  it('returns zero translate when the inner track does not overflow the viewport', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -400,
      outerHeight: 1600,
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
    const outerTop = -400

    const { result } = renderHorizontalScrollHook({
      outerTop: () => outerTop,
      outerHeight: 1600,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))
    expect(result.current).toEqual({ progress: 0.5, tx: -800 })

    setViewport(1200, 800)
    act(() => window.dispatchEvent(new Event('resize')))

    expect(result.current).toEqual({ progress: 0.5, tx: -700 })
  })

  it('keeps the first card centered at progress 0 when proj-edge spacers are included in scroll width', () => {
    setViewport(1000, 800)

    const cardWidth = 480
    const cardGap = PROJECT_CARD_GAP
    const edgeWidth = getEdgeSpacerWidth(1000, cardWidth)
    const innerScrollWidth = edgeWidth * 2 + cardWidth * 2 + cardGap

    const { result } = renderHorizontalScrollHook({
      outerTop: 0,
      outerHeight: 1600,
      innerScrollWidth,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(0)
    expect(result.current.tx).toBe(0)
    expect(cardCenterX(result.current.tx, 0, cardWidth, cardGap, edgeWidth)).toBe(1000 / 2)
  })

  it('keeps the last card centered at progress 1 when proj-edge spacers are included in scroll width', () => {
    setViewport(1000, 800)

    const cardWidth = 480
    const cardGap = PROJECT_CARD_GAP
    const edgeWidth = getEdgeSpacerWidth(1000, cardWidth)
    const innerScrollWidth = edgeWidth * 2 + cardWidth * 2 + cardGap

    const { result } = renderHorizontalScrollHook({
      outerTop: -800,
      outerHeight: 1600,
      innerScrollWidth,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(1)
    expect(cardCenterX(result.current.tx, 1, cardWidth, cardGap, edgeWidth)).toBe(1000 / 2)
  })
})
