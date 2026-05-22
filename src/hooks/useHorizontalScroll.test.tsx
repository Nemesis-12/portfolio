import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import { useHorizontalScroll, applyDeadZones, clamp01 } from './useHorizontalScroll'

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

  it('keeps the first card centered at progress 0 when proj-edge spacers are included in scroll width', () => {
    setViewport(1000, 800)

    const cardWidth = 480
    const cardGap = 56
    const edgeWidth = 1000 / 2 - Math.min(cardWidth / 2, 1000 * 0.39)
    const innerScrollWidth = edgeWidth * 2 + cardWidth * 2 + cardGap

    const { result } = renderHorizontalScrollHook({
      outerTop: 0,
      outerHeight: 2400,
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
    const cardGap = 56
    const edgeWidth = 1000 / 2 - Math.min(cardWidth / 2, 1000 * 0.39)
    const innerScrollWidth = edgeWidth * 2 + cardWidth * 2 + cardGap

    const { result } = renderHorizontalScrollHook({
      outerTop: -1600,
      outerHeight: 2400,
      innerScrollWidth,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(1)
    expect(cardCenterX(result.current.tx, 1, cardWidth, cardGap, edgeWidth)).toBe(1000 / 2)
  })

  it('holds the first card centered through the leading dead zone', () => {
    setViewport(1000, 800)

    const cardWidth = 480
    const cardGap = 56
    const edgeWidth = 1000 / 2 - Math.min(cardWidth / 2, 1000 * 0.39)
    const innerScrollWidth = edgeWidth * 2 + cardWidth * 2 + cardGap

    const { result } = renderHorizontalScrollHook({
      outerTop: -160,
      outerHeight: 2400,
      innerScrollWidth,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(0)
    expect(result.current.tx).toBe(0)
    expect(cardCenterX(result.current.tx, 0, cardWidth, cardGap, edgeWidth)).toBe(1000 / 2)
  })

  it('holds the last card centered through the trailing dead zone', () => {
    setViewport(1000, 800)

    const cardWidth = 480
    const cardGap = 56
    const edgeWidth = 1000 / 2 - Math.min(cardWidth / 2, 1000 * 0.39)
    const innerScrollWidth = edgeWidth * 2 + cardWidth * 2 + cardGap

    const { result } = renderHorizontalScrollHook({
      outerTop: -1440,
      outerHeight: 2400,
      innerScrollWidth,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(1)
    expect(cardCenterX(result.current.tx, 1, cardWidth, cardGap, edgeWidth)).toBe(1000 / 2)
  })
})

describe('applyDeadZones', () => {
  it('returns 0 when raw progress is before start', () => {
    expect(applyDeadZones(0, 0.125)).toBe(0)
  })

  it('returns 0 within the first dead zone', () => {
    expect(applyDeadZones(0.06, 0.125)).toBe(0)
    expect(applyDeadZones(0.125, 0.125)).toBe(0)
  })

  it('maps the midpoint linearly between dead zones', () => {
    const result = applyDeadZones(0.5, 0.125)
    expect(result).toBeCloseTo(0.5, 4)
  })

  it('returns 1 within the final dead zone', () => {
    expect(applyDeadZones(0.875, 0.125)).toBe(1)
    expect(applyDeadZones(0.94, 0.125)).toBe(1)
  })

  it('returns 1 after end', () => {
    expect(applyDeadZones(1, 0.125)).toBe(1)
    expect(applyDeadZones(1.2, 0.125)).toBe(1)
  })

  it('maps linearly between the leading and trailing dead zones', () => {
    const deadZone = 0.125
    const result = applyDeadZones(0.3, deadZone)
    const expected = (0.3 - deadZone) / (1 - deadZone * 2)
    expect(result).toBeCloseTo(expected, 4)
  })

  it('returns raw progress when dead zone is zero', () => {
    expect(applyDeadZones(0.25, 0)).toBe(0.25)
    expect(applyDeadZones(0.75, 0)).toBe(0.75)
  })

  it('returns 0 for negative raw progress (falls within leading dead zone)', () => {
    expect(applyDeadZones(-0.1, 0.125)).toBe(0)
  })
})

describe('clamp01', () => {
  it('returns 0 for negative values', () => {
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(-10)).toBe(0)
  })

  it('returns 1 for values above 1', () => {
    expect(clamp01(1.5)).toBe(1)
    expect(clamp01(10)).toBe(1)
  })

  it('passes through values between 0 and 1', () => {
    expect(clamp01(0)).toBe(0)
    expect(clamp01(0.5)).toBe(0.5)
    expect(clamp01(1)).toBe(1)
  })
})
