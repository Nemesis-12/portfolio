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
  getTagVariant,
  PROJECT_CARD_GAP,
  PROJECT_CARD_WIDTH,
  PROJECTS_SECTION_PADDING_X,
  TAG_VARIANTS,
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
    it('matches calc(50vw - 88px - min(280px, 39vw)) for desktop card width', () => {
      // 88px = PROJECTS_SECTION_PADDING_X (32) + PROJECT_CARD_GAP (56): the spacer must give
      // up both the #projects px-8 padding and the flex gap inserted before the first card
      // (and after the last card) so the first/last card lands centered in the viewport.
      expect(getEdgeSpacerWidth(1440)).toBe(352)
      expect(getEdgeSpacerWidth(1000)).toBe(132)
    })

    it('uses the same width for both the leading and trailing spacer', () => {
      // .proj-edge is a single shared class — both ends must match exactly, otherwise the
      // first and last card would center against different points.
      expect(getEdgeSpacerWidth(1440)).toBe(getEdgeSpacerWidth(1440))
    })

    it('clamps to zero instead of going negative on very narrow viewports', () => {
      expect(getEdgeSpacerWidth(200)).toBe(0)
    })
  })

  describe('getCarouselTrackWidth', () => {
    it('returns zero when there are no projects', () => {
      expect(getCarouselTrackWidth(0, 1440)).toBe(0)
    })

    it('includes a flex gap between each edge spacer and its adjacent card', () => {
      const viewportWidth = 1200
      const projectCount = 4
      const edgeWidth = getEdgeSpacerWidth(viewportWidth)
      const cardsWidth = projectCount * PROJECT_CARD_WIDTH + (projectCount - 1) * PROJECT_CARD_GAP
      const expected = edgeWidth * 2 + PROJECT_CARD_GAP * 2 + cardsWidth

      expect(getCarouselTrackWidth(projectCount, viewportWidth)).toBe(expected)
    })

    it('returns just the two edge spacers plus their gaps and a single card for one project', () => {
      const viewportWidth = 1440
      const edgeWidth = getEdgeSpacerWidth(viewportWidth)
      expect(getCarouselTrackWidth(1, viewportWidth)).toBe(
        edgeWidth * 2 + PROJECT_CARD_GAP * 2 + PROJECT_CARD_WIDTH,
      )
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
      expect(getProjectCardCenterX(0, 0, viewportWidth)).toBe(carouselViewportWidth / 2)
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

  describe('real-browser flex layout regression (gap lands on every adjacent child)', () => {
    // `.proj-track{gap:56px}` inserts PROJECT_CARD_GAP between *every* adjacent flex child —
    // not just between cards. That means the real rendered content width is
    // `edge + gap + cards(+inner gaps) + gap + edge`, not `edge + cards(+inner gaps) + edge`.
    // getCarouselTrackWidth must mirror that or `tx`/scrollWidth math drifts from the DOM.
    function sumOfFlexChildrenWithGaps(
      edgeWidth: number,
      cardWidth: number,
      cardGap: number,
      projectCount: number,
    ) {
      const children = [edgeWidth, ...Array(projectCount).fill(cardWidth), edgeWidth]
      const innerGapCount = children.length - 1
      return children.reduce((a, b) => a + b, 0) + innerGapCount * cardGap
    }

    it('matches a literal flex-children-plus-gaps sum for 2, 5, and 6 projects', () => {
      const viewportWidth = 1440
      const edgeWidth = getEdgeSpacerWidth(viewportWidth)

      for (const projectCount of [2, 5, 6]) {
        const expected = sumOfFlexChildrenWithGaps(edgeWidth, PROJECT_CARD_WIDTH, PROJECT_CARD_GAP, projectCount)
        expect(getCarouselTrackWidth(projectCount, viewportWidth)).toBe(expected)
      }
    })

    it('centers both the first and last card for the real two-project dataset at 1440px', () => {
      const viewportWidth = 1440
      const projectCount = 2
      const trackWidth = getCarouselTrackWidth(projectCount, viewportWidth)
      const carouselViewportWidth = getProjectsCarouselViewportWidth(viewportWidth)

      const txStart = getProjectsTrackTranslate(0, trackWidth, viewportWidth)
      const txEnd = getProjectsTrackTranslate(1, trackWidth, viewportWidth)

      expect(getProjectCardCenterX(txStart, 0, viewportWidth)).toBe(carouselViewportWidth / 2)
      expect(getProjectCardCenterX(txEnd, projectCount - 1, viewportWidth)).toBe(carouselViewportWidth / 2)
    })

    it.each([
      { viewportWidth: 1024, projectCount: 2 },
      { viewportWidth: 1280, projectCount: 5 },
      { viewportWidth: 1440, projectCount: 5 },
      { viewportWidth: 1920, projectCount: 6 },
    ])(
      'centers the last card at a $viewportWidth px viewport with $projectCount projects',
      ({ viewportWidth, projectCount }) => {
        const trackWidth = getCarouselTrackWidth(projectCount, viewportWidth)
        const carouselViewportWidth = getProjectsCarouselViewportWidth(viewportWidth)
        const tx = getProjectsTrackTranslate(1, trackWidth, viewportWidth)

        expect(getProjectCardCenterX(tx, projectCount - 1, viewportWidth)).toBeCloseTo(
          carouselViewportWidth / 2,
          5,
        )
      },
    )

    it('keeps the first card centered regardless of project count', () => {
      const viewportWidth = 1440
      const carouselViewportWidth = getProjectsCarouselViewportWidth(viewportWidth)

      for (const projectCount of [1, 2, 3, 5, 6]) {
        const trackWidth = getCarouselTrackWidth(projectCount, viewportWidth)
        const tx = getProjectsTrackTranslate(0, trackWidth, viewportWidth)
        expect(getProjectCardCenterX(tx, 0, viewportWidth)).toBeCloseTo(carouselViewportWidth / 2, 5)
      }
    })
  })

  describe('getTagVariant', () => {
    it('returns fuchsia, blue, orange, yellow in order for the first four tag indices', () => {
      expect(getTagVariant(0)).toBe('fuchsia')
      expect(getTagVariant(1)).toBe('blue')
      expect(getTagVariant(2)).toBe('orange')
      expect(getTagVariant(3)).toBe('yellow')
    })

    it('cycles back to fuchsia after exhausting the palette', () => {
      expect(getTagVariant(4)).toBe('fuchsia')
      expect(getTagVariant(5)).toBe('blue')
    })

    it('cycles deterministically for an arbitrary number of tags', () => {
      const indices = Array.from({ length: 10 }, (_, i) => i)
      const variants = indices.map(getTagVariant)
      expect(variants).toEqual(indices.map((i) => TAG_VARIANTS[i % TAG_VARIANTS.length]))
    })
  })
})
