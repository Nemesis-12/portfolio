import { describe, expect, it } from 'vitest'
import {
  getTimelineActiveIndex,
  getTimelineScrollProgress,
  getTimelineScrollRangeVh,
  getTimelineSnapAnchorTopVh,
  getTimelineTrackTranslate,
} from './timelineGeometry'

describe('timelineGeometry', () => {
  it('uses one viewport height per timeline entry', () => {
    expect(getTimelineScrollRangeVh(3)).toBe(3)
    expect(getTimelineScrollRangeVh(0)).toBe(1)
  })

  it('maps scroll progress to quantized active indices', () => {
    expect(getTimelineActiveIndex(0, 3)).toBe(0)
    expect(getTimelineActiveIndex(0.49, 3)).toBe(1)
    expect(getTimelineActiveIndex(1, 3)).toBe(2)
  })

  it('keeps the sole entry active when only one timeline entry exists', () => {
    expect(getTimelineActiveIndex(0, 1)).toBe(0)
    expect(getTimelineActiveIndex(0.75, 1)).toBe(0)
    expect(getTimelineTrackTranslate(0, 1, 1000)).toBe(0)
  })

  it('computes raw vertical progress from section geometry', () => {
    expect(getTimelineScrollProgress(800, 2400, 800)).toBe(0)
    expect(getTimelineScrollProgress(-800, 2400, 800)).toBe(0.5)
    expect(getTimelineScrollProgress(-1600, 2400, 800)).toBe(1)
  })

  it('translates the reversed track so newest starts centered', () => {
    expect(getTimelineTrackTranslate(0, 3, 1000)).toBe(-2000)
    expect(getTimelineTrackTranslate(1, 3, 1000)).toBe(-1000)
    expect(getTimelineTrackTranslate(2, 3, 1000)).toEqual(0)
  })

  it('places snap anchors at one viewport per entry', () => {
    expect(getTimelineSnapAnchorTopVh(0)).toBe(0)
    expect(getTimelineSnapAnchorTopVh(1)).toBe(100)
    expect(getTimelineSnapAnchorTopVh(2)).toBe(200)
  })
})
