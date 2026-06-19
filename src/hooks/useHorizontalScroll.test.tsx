import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'
import {
  getCarouselTrackWidth,
  getEdgeSpacerWidth,
  getProjectsCarouselViewportWidth,
  PROJECT_CARD_GAP,
} from '../components/projectsGeometry'
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

function createChildRect(left: number, right: number): DOMRect {
  return {
    top: 0,
    bottom: 0,
    left,
    right,
    width: right - left,
    height: 0,
    x: left,
    y: 0,
    toJSON: () => ({}),
  }
}

/**
 * Builds an `inner` track with real first/last children (mocked via getBoundingClientRect)
 * so the hook's content-width measurement reads from child rects exactly as it does against
 * the real DOM — `scrollWidth` is intentionally left at jsdom's default (0) to prove the hook
 * no longer depends on it when children are present.
 */
function renderHorizontalScrollHookWithChildren({
  outerTop,
  outerHeight,
  firstChildLeft,
  lastChildRight,
}: {
  outerTop: number
  outerHeight: number
  firstChildLeft: number
  lastChildRight: number
}) {
  const outer = document.createElement('section')
  const inner = document.createElement('div')
  const first = document.createElement('div')
  const last = document.createElement('div')
  inner.appendChild(first)
  inner.appendChild(document.createElement('div'))
  inner.appendChild(last)

  first.getBoundingClientRect = vi.fn(() => createChildRect(firstChildLeft, firstChildLeft))
  last.getBoundingClientRect = vi.fn(() => createChildRect(lastChildRight, lastChildRight))
  outer.getBoundingClientRect = vi.fn(() => createRect(outerTop, outerHeight))

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
  // The flex `gap` lands between the leading spacer and the first card too.
  return tx + edgeWidth + cardGap + cardIndex * (cardWidth + cardGap) + cardWidth / 2
}

function horizontalDistance(innerScrollWidth: number, viewportWidth: number) {
  return innerScrollWidth - getProjectsCarouselViewportWidth(viewportWidth)
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
    expect(result.current.tx).toBe(-0.5 * horizontalDistance(2600, 1000))
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
    expect(result.current.tx).toBeCloseTo(-0.2 * horizontalDistance(2600, 1000), 0)
  })

  it('returns full progress and max translate after the outer container scrolls fully past', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -800,
      outerHeight: 1600,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 1, tx: -horizontalDistance(2600, 1000) })
  })

  it('clamps progress to 1 when scrolled past the section end', () => {
    setViewport(1000, 800)

    const { result } = renderHorizontalScrollHook({
      outerTop: -1200,
      outerHeight: 1600,
      innerScrollWidth: 2600,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current).toEqual({ progress: 1, tx: -horizontalDistance(2600, 1000) })
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
    expect(result.current).toEqual({ progress: 0.5, tx: -0.5 * horizontalDistance(2600, 1000) })

    setViewport(1200, 800)
    act(() => window.dispatchEvent(new Event('resize')))

    expect(result.current).toEqual({ progress: 0.5, tx: -0.5 * horizontalDistance(2600, 1200) })
  })

  it('keeps the first card centered at progress 0 when proj-edge spacers are included in scroll width', () => {
    setViewport(1000, 800)

    const cardWidth = 480
    const cardGap = PROJECT_CARD_GAP
    const edgeWidth = getEdgeSpacerWidth(1000, cardWidth)
    // Mirrors the real flex layout: a `cardGap`-wide gap also lands between each edge
    // spacer and its adjacent card, not just between the two cards.
    const innerScrollWidth = getCarouselTrackWidth(2, 1000, cardWidth, cardGap)

    const { result } = renderHorizontalScrollHook({
      outerTop: 0,
      outerHeight: 1600,
      innerScrollWidth,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(0)
    expect(result.current.tx).toBe(0)
    expect(cardCenterX(result.current.tx, 0, cardWidth, cardGap, edgeWidth)).toBe(
      getProjectsCarouselViewportWidth(1000) / 2,
    )
  })

  it('keeps the last card centered at progress 1 when proj-edge spacers are included in scroll width', () => {
    setViewport(1000, 800)

    const cardWidth = 480
    const cardGap = PROJECT_CARD_GAP
    const edgeWidth = getEdgeSpacerWidth(1000, cardWidth)
    const innerScrollWidth = getCarouselTrackWidth(2, 1000, cardWidth, cardGap)

    const { result } = renderHorizontalScrollHook({
      outerTop: -800,
      outerHeight: 1600,
      innerScrollWidth,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(result.current.progress).toBe(1)
    expect(cardCenterX(result.current.tx, 1, cardWidth, cardGap, edgeWidth)).toBe(
      getProjectsCarouselViewportWidth(1000) / 2,
    )
  })

  describe('content width measurement (real browser scrollWidth regression)', () => {
    // Chromium under-reports `scrollWidth` for a flex row that has `align-items: center`
    // together with overflowing `flex-shrink: 0` children — exactly the `.proj-track` shape.
    // The hook must measure from the first/last child's own rects instead, which stay
    // accurate regardless of that quirk. These tests render real child elements (rather than
    // stubbing `scrollWidth`) to guard against silently reverting to the broken measurement.
    it('derives translate from the first/last child rects, not scrollWidth', () => {
      setViewport(1000, 800)

      const { result } = renderHorizontalScrollHookWithChildren({
        outerTop: -800,
        outerHeight: 1600,
        firstChildLeft: -200,
        lastChildRight: 1800,
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      // content width = 1800 - (-200) = 2000; carousel viewport width = getProjectsCarouselViewportWidth(1000)
      const expectedTrackWidth = 2000 - getProjectsCarouselViewportWidth(1000)
      expect(result.current.progress).toBe(1)
      expect(result.current.tx).toBe(-expectedTrackWidth)
    })

    it('falls back to scrollWidth when the track has no children', () => {
      setViewport(1000, 800)

      const { result } = renderHorizontalScrollHook({
        outerTop: -800,
        outerHeight: 1600,
        innerScrollWidth: 2600,
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current).toEqual({ progress: 1, tx: -horizontalDistance(2600, 1000) })
    })
  })
})
