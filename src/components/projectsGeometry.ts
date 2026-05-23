/** Desktop project card width used for carousel centering (matches `.pcard` CSS). */
export const PROJECT_CARD_WIDTH = 560

/** Gap between project cards in the carousel track (matches `.proj-track` CSS). */
export const PROJECT_CARD_GAP = 56

/** Returns edge spacer width in px (matches `.proj-edge` calc for a fixed card width). */
export function getEdgeSpacerWidth(viewportWidth: number, cardWidth = PROJECT_CARD_WIDTH) {
  return viewportWidth / 2 - Math.min(cardWidth / 2, viewportWidth * 0.39)
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

/** Formats a project id as the v4 card number prefix (e.g. "1" → "_01"). */
export function formatProjectNumber(id: string) {
  return `_${id.padStart(2, '0')}`
}
