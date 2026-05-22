import { describe, expect, it } from 'vitest'
import {
  formatProjectNumber,
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
  })

  it('exports the reference proj-track gap in pixels', () => {
    expect(PROJECT_CARD_GAP).toBe(56)
  })

  describe('getEdgeSpacerWidth', () => {
    it('matches calc(50vw - min(280px, 39vw)) for desktop card width', () => {
      expect(getEdgeSpacerWidth(1440)).toBe(440)
      expect(getEdgeSpacerWidth(1000)).toBe(220)
    })
  })
})
