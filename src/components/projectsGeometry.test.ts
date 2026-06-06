import { describe, expect, it } from 'vitest'
import {
  EDGE_SPACER_MAX_VW_FRACTION,
  formatProjectNumber,
  getCarouselTrackWidth,
  getProjectCardCenterX,
  getProjectsCarouselViewportWidth,
  getProjectsScrollProgress,
  getProjectsTrackState,
  getProjectsTrackTranslate,
  getEdgeSpacerWidth,
  getScrollRangeVh,
  getTrailingEdgeSpacerWidth,
  PROJECT_CARD_GAP,
  PROJECT_CARD_WIDTH,
  PROJECTS_SECTION_PADDING_X,
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

  it('exports the projects section horizontal padding matching px-8', () => {
    expect(PROJECTS_SECTION_PADDING_X).toBe(32)
  })

  describe('getEdgeSpacerWidth', () => {
    it('matches calc(50vw - min(280px, 39vw)) for desktop card width', () => {
      expect(getEdgeSpacerWidth(1440)).toBe(440)
      expect(getEdgeSpacerWidth(1000)).toBe(220)
    })
  })

  describe('getTrailingEdgeSpacerWidth', () => {
    it('matches calc(50% - min(280px, 39vw)) inside the padded sticky viewport', () => {
      expect(getTrailingEdgeSpacerWidth(1440)).toBe(408)
      expect(getTrailingEdgeSpacerWidth(1000)).toBe(188)
    })

    it('is narrower than the leading spacer by the section horizontal padding', () => {
      expect(getEdgeSpacerWidth(1440) - getTrailingEdgeSpacerWidth(1440)).toBe(
        PROJECTS_SECTION_PADDING_X,
      )
    })
  })

  describe('getCarouselTrackWidth', () => {
    it('returns zero when there are no projects', () => {
      expect(getCarouselTrackWidth(0, 1440)).toBe(0)
    })

    it('uses asymmetric leading and trailing edge spacers', () => {
      expect(getCarouselTrackWidth(4, 1200)).toBe(3016)
    })
  })

  describe('Projects track progress math', () => {
    const viewportWidth = 1200
    const viewportHeight = 900
    const projectCount = 4
    const trackWidth = getCarouselTrackWidth(projectCount, viewportWidth)
    const carouselViewportWidth = getProjectsCarouselViewportWidth(viewportWidth)

    it('starts with zero progress and the first card centered', () => {
      expect(getProjectsTrackState(0, projectCount, viewportHeight, trackWidth, viewportWidth)).toEqual({
        progress: 0,
        tx: 0,
      })
      expect(getProjectCardCenterX(0, 0, viewportWidth)).toBe(viewportWidth / 2)
      expect(
        getProjectCardCenterX(0, 0, viewportWidth) - getProjectsCarouselViewportWidth(viewportWidth) / 2,
      ).toBe(PROJECTS_SECTION_PADDING_X)
    })

    it('maps the middle of the vertical runway to the middle of the horizontal overflow', () => {
      expect(getProjectsTrackState(-1350, projectCount, viewportHeight, trackWidth, viewportWidth)).toEqual({
        progress: 0.5,
        tx: -0.5 * (trackWidth - carouselViewportWidth),
      })
    })

    it('ends at full progress with the last card centered', () => {
      const { progress, tx } = getProjectsTrackState(-2700, projectCount, viewportHeight, trackWidth, viewportWidth)
      expect(progress).toBe(1)
      expect(tx).toBe(-(trackWidth - carouselViewportWidth))
      expect(getProjectCardCenterX(tx, projectCount - 1, viewportWidth)).toBe(
        carouselViewportWidth / 2,
      )
    })

    it('centers the last card for five projects at a 1440px viewport', () => {
      const desktopViewportWidth = 1440
      const fiveProjectCount = 5
      const fiveProjectTrackWidth = getCarouselTrackWidth(fiveProjectCount, desktopViewportWidth)
      const fiveProjectCarouselViewportWidth = getProjectsCarouselViewportWidth(desktopViewportWidth)
      const runwayPx = (fiveProjectCount - 1) * 900
      const { progress, tx } = getProjectsTrackState(
        -runwayPx,
        fiveProjectCount,
        900,
        fiveProjectTrackWidth,
        desktopViewportWidth,
      )

      expect(progress).toBe(1)
      expect(tx).toBe(-(fiveProjectTrackWidth - fiveProjectCarouselViewportWidth))
      expect(getProjectCardCenterX(tx, fiveProjectCount - 1, desktopViewportWidth)).toBe(
        fiveProjectCarouselViewportWidth / 2,
      )
    })

    it('recomputes progress from the current viewport height after resize', () => {
      expect(getProjectsScrollProgress(-1350, 4, 900)).toBe(0.5)
      expect(getProjectsScrollProgress(-1350, 4, 600)).toBe(0.75)
    })

    it('recomputes translation from the current viewport width after resize', () => {
      expect(getProjectsTrackTranslate(0.5, 2600, 1000)).toBe(-0.5 * (2600 - getProjectsCarouselViewportWidth(1000)))
      expect(getProjectsTrackTranslate(0.5, 2600, 1200)).toBe(-0.5 * (2600 - getProjectsCarouselViewportWidth(1200)))
    })

    it('keeps progress while suppressing translation when the track does not overflow', () => {
      expect(getProjectsTrackState(-1350, 4, 900, 1000, 1200)).toEqual({
        progress: 0.5,
        tx: 0,
      })
    })
  })
})
