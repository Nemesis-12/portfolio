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
 *
 * Sync is enforced by `src/portfolio-css-geometry.test.ts`.
 */

/** Desktop project card width used for carousel centering (matches `.pcard` CSS). */
export const PROJECT_CARD_WIDTH = 560

/** Gap between project cards in the carousel track (matches `.proj-track` CSS). */
export const PROJECT_CARD_GAP = 56

/** Max half-card width as a fraction of viewport width (matches `39vw` in `.proj-edge`). */
export const EDGE_SPACER_MAX_VW_FRACTION = 0.39

/** Returns edge spacer width in px (matches `.proj-edge` calc for a fixed card width). */
export function getEdgeSpacerWidth(viewportWidth: number, cardWidth = PROJECT_CARD_WIDTH) {
  return viewportWidth / 2 - Math.min(cardWidth / 2, viewportWidth * EDGE_SPACER_MAX_VW_FRACTION)
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
  return edgeWidth * 2 + cardsWidth
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
  const horizontalDistance = Math.max(trackWidth - viewportWidth, 0)
  if (horizontalDistance === 0 || progress === 0) {
    return 0
  }

  return -(clamp01(progress) * horizontalDistance)
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
