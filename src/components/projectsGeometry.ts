/** Desktop project card width used for carousel centering (matches `.pcard` CSS). */
export const PROJECT_CARD_WIDTH = 560

/** Returns the Projects section height multiplier in viewport-height units. */
export function getScrollRangeVh(projectCount: number) {
  return projectCount * 1.5 + 1
}
