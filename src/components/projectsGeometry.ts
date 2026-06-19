import { clamp01 } from '../utils/math'

/**
 * Layout token contract — CSS values that MUST stay in sync with these constants:
 *
 * | TS constant / formula              | CSS location |
 * |------------------------------------|--------------|
 * | PROJECT_CARD_WIDTH (560)           | `.pcard { width: min(560px, 78vw) }` |
 * | PROJECT_CARD_GAP (56)              | `.proj-track { gap: 56px }` |
 * | PROJECT_CARD_WIDTH / 2 (280)       | `.proj-edge { min(280px, …) }` |
 * | EDGE_SPACER_MAX_VW_FRACTION (0.39) | `.proj-edge { min(…, 39vw) }` |
 * | viewport * 0.5 (50vw)              | `.proj-edge { calc(50vw - …) }` |
 * | PROJECTS_SECTION_PADDING_X (32)    | `#projects { px-8 }`, `.proj-edge { calc(… - 88px - …) }` |
 * | PROJECT_CARD_GAP (56)              | also folded into that same 88px (`32 + 56`) term |
 *
 * Sync is enforced by `src/portfolio-css-geometry.test.ts`.
 *
 * Why the edge spacer subtracts both PROJECTS_SECTION_PADDING_X and PROJECT_CARD_GAP:
 * `.proj-track{gap:56px}` inserts a gap between *every* adjacent flex child, including
 * between `.proj-edge` and the first/last card — not just between cards. And `#projects`
 * has `px-8` padding, so the sticky viewport's own center is offset from `.proj-edge`'s
 * `50vw` reference point. Both offsets must be subtracted from the spacer width, or the
 * first/last card lands off-center by `PROJECTS_SECTION_PADDING_X + PROJECT_CARD_GAP` px.
 */

/** Desktop project card width used for carousel centering (matches `.pcard` CSS). */
export const PROJECT_CARD_WIDTH = 560

/** Gap between project cards in the carousel track (matches `.proj-track` CSS). */
export const PROJECT_CARD_GAP = 56

/** Horizontal padding on `#projects` from Tailwind `px-8` (each side). */
export const PROJECTS_SECTION_PADDING_X = 32

/** Max half-card width as a fraction of viewport width (matches `39vw` in `.proj-edge`). */
export const EDGE_SPACER_MAX_VW_FRACTION = 0.39

/** Returns the sticky viewport content width inside `#projects` (full viewport minus `px-8`). */
export function getProjectsCarouselViewportWidth(viewportWidth: number) {
  return viewportWidth - 2 * PROJECTS_SECTION_PADDING_X
}

/**
 * Returns edge spacer width in px (matches `.proj-edge` for a fixed card width). The same
 * value is used for both the leading and trailing spacer — see the module doc comment for
 * why `PROJECTS_SECTION_PADDING_X` and `PROJECT_CARD_GAP` are both subtracted.
 */
export function getEdgeSpacerWidth(viewportWidth: number, cardWidth = PROJECT_CARD_WIDTH) {
  return Math.max(
    viewportWidth / 2
      - PROJECTS_SECTION_PADDING_X
      - PROJECT_CARD_GAP
      - Math.min(cardWidth / 2, viewportWidth * EDGE_SPACER_MAX_VW_FRACTION),
    0,
  )
}

/** Returns the total horizontal scroll width of a project carousel track. */
export function getCarouselTrackWidth(
  projectCount: number,
  viewportWidth: number,
  cardWidth = PROJECT_CARD_WIDTH,
  cardGap = PROJECT_CARD_GAP,
) {
  if (projectCount === 0) {
    return 0
  }

  const edgeWidth = getEdgeSpacerWidth(viewportWidth, cardWidth)
  const cardsWidth = projectCount * cardWidth + Math.max(projectCount - 1, 0) * cardGap
  // One `cardGap`-wide flex gap lands on each side: between the leading spacer and the
  // first card, and between the last card and the trailing spacer.
  return edgeWidth * 2 + cardGap * 2 + cardsWidth
}

/** Returns the Projects section height multiplier in viewport-height units (one viewport per project). */
export function getScrollRangeVh(projectCount: number) {
  return Math.max(projectCount, 1)
}

/** Returns the vertical Projects scroll runway in pixels. */
export function getProjectsScrollRunwayPx(projectCount: number, viewportHeight: number) {
  return Math.max(getScrollRangeVh(projectCount) - 1, 0) * viewportHeight
}

/** Returns Projects vertical scroll progress from section top and runway geometry. */
export function getProjectsScrollProgress(
  sectionTop: number,
  projectCount: number,
  viewportHeight: number,
) {
  const scrollRunway = getProjectsScrollRunwayPx(projectCount, viewportHeight)
  if (scrollRunway === 0) {
    return 0
  }

  return clamp01(-sectionTop / scrollRunway)
}

/** Returns Projects track translation for the actual horizontal overflow. */
export function getProjectsTrackTranslate(progress: number, trackWidth: number, viewportWidth: number) {
  const carouselViewportWidth = getProjectsCarouselViewportWidth(viewportWidth)
  const horizontalDistance = Math.max(trackWidth - carouselViewportWidth, 0)
  if (horizontalDistance === 0 || progress === 0) {
    return 0
  }

  return -(clamp01(progress) * horizontalDistance)
}

/** Returns the x-position of a project card center for carousel geometry assertions. */
export function getProjectCardCenterX(
  tx: number,
  cardIndex: number,
  viewportWidth: number,
  cardWidth = PROJECT_CARD_WIDTH,
  cardGap = PROJECT_CARD_GAP,
) {
  const leadingEdgeWidth = getEdgeSpacerWidth(viewportWidth, cardWidth)
  return (
    tx
    + leadingEdgeWidth
    // The flex `gap` lands between the leading spacer and the first card too.
    + cardGap
    + cardIndex * (cardWidth + cardGap)
    + cardWidth / 2
  )
}

/** Maps Projects section scroll geometry to track progress and translation. */
export function getProjectsTrackState(
  sectionTop: number,
  projectCount: number,
  viewportHeight: number,
  trackWidth: number,
  viewportWidth: number,
) {
  const progress = getProjectsScrollProgress(sectionTop, projectCount, viewportHeight)

  return {
    progress,
    tx: getProjectsTrackTranslate(progress, trackWidth, viewportWidth),
  }
}

/** Formats a project id as the v4 card number prefix (e.g. "1" → "_01"). */
export function formatProjectNumber(id: string) {
  return `_${id.padStart(2, '0')}`
}
