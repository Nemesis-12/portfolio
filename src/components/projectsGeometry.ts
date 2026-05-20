/** Returns the Projects section height multiplier in viewport-height units. */
export function getScrollRangeVh(projectCount: number) {
  return projectCount * 1.5 + 1
}
