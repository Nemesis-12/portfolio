import { describe, expect, it } from 'vitest'
import {
  EDGE_SPACER_MAX_VW_FRACTION,
  formatProjectNumber,
  getProjectsScrollProgress,
  getProjectsTrackState,
  getProjectsTrackTranslate,
  getEdgeSpacerWidth,
  getScrollRangeVh,
  PROJECT_CARD_GAP,
  PROJECT_CARD_WIDTH,
} from './projectsGeometry'

describe('projectsGeometry', () => {
  it('exports desktop card width matching pcard CSS', () => {
    expect(PROJECT_CARD_WIDTH).toBe(560)
  })

  describe('formatProjectNumber', () => {
    it('zero-pads single-digit ids', () => {
      expect(formatProjectNumber('1')).toBe('_01')
      expect(formatProjectNumber('9')).toBe('_09')
    })

    it('preserves two-digit ids', () => {
      expect(formatProjectNumber('10')).toBe('_10')
      expect(formatProjectNumber('12')).toBe('_12')
    })

    it('does not truncate ids longer than two characters', () => {
      expect(formatProjectNumber('100')).toBe('_100')
    })
  })

  describe('getScrollRangeVh', () => {
    it('returns 1 when there are no projects', () => {
      expect(getScrollRangeVh(0)).toBe(1)
    })

    it('returns one viewport per project', () => {
      expect(getScrollRangeVh(1)).toBe(1)
      expect(getScrollRangeVh(2)).toBe(2)
      expect(getScrollRangeVh(3)).toBe(3)
      expect(getScrollRangeVh(6)).toBe(6)
    })
  })

  it('exports the reference proj-track gap in pixels', () => {
    expect(PROJECT_CARD_GAP).toBe(56)
  })

  it('exports the edge spacer viewport fraction matching proj-edge CSS', () => {
    expect(EDGE_SPACER_MAX_VW_FRACTION).toBe(0.39)
  })

  describe('getEdgeSpacerWidth', () => {
    it('matches calc(50vw - min(280px, 39vw)) for desktop card width', () => {
      expect(getEdgeSpacerWidth(1440)).toBe(440)
      expect(getEdgeSpacerWidth(1000)).toBe(220)
    })
  })

  describe('Projects track progress math', () => {
    it('starts with zero progress and the first card centered', () => {
      expect(getProjectsTrackState(0, 4, 900, 3200, 1200)).toEqual({
        progress: 0,
        tx: 0,
      })
    })

    it('maps the middle of the vertical runway to the middle of the horizontal overflow', () => {
      expect(getProjectsTrackState(-1350, 4, 900, 3200, 1200)).toEqual({
        progress: 0.5,
        tx: -1000,
      })
    })

    it('ends at full progress with the last card centered', () => {
      expect(getProjectsTrackState(-2700, 4, 900, 3200, 1200)).toEqual({
        progress: 1,
        tx: -2000,
      })
    })

    it('recomputes progress from the current viewport height after resize', () => {
      expect(getProjectsScrollProgress(-1350, 4, 900)).toBe(0.5)
      expect(getProjectsScrollProgress(-1350, 4, 600)).toBe(0.75)
    })

    it('recomputes translation from the current viewport width after resize', () => {
      expect(getProjectsTrackTranslate(0.5, 2600, 1000)).toBe(-800)
      expect(getProjectsTrackTranslate(0.5, 2600, 1200)).toBe(-700)
    })

    it('keeps progress while suppressing translation when the track does not overflow', () => {
      expect(getProjectsTrackState(-1350, 4, 900, 1000, 1200)).toEqual({
        progress: 0.5,
        tx: 0,
      })
    })
  })
})
