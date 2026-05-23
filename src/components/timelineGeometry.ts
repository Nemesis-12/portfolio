import { clamp01 } from '../hooks/useHorizontalScroll'

/** Returns the Timeline section height multiplier in viewport-height units. */
export function getTimelineScrollRangeVh(entryCount: number) {
  return Math.max(entryCount, 1)
}

/** Maps vertical scroll progress to the active timeline content index (0 = newest). */
export function getTimelineActiveIndex(progress: number, entryCount: number) {
  if (entryCount <= 1) {
    return 0
  }

  return Math.max(0, Math.min(entryCount - 1, Math.round(progress * (entryCount - 1))))
}

/** Returns raw vertical scroll progress for a tall timeline section. */
export function getTimelineScrollProgress(sectionTop: number, sectionHeight: number, viewportHeight: number) {
  const scrollRange = Math.max(sectionHeight - viewportHeight, 0)
  if (scrollRange === 0) {
    return 0
  }

  return clamp01(-sectionTop / scrollRange)
}

/**
 * Quantized horizontal translate for a reversed track (oldest left, newest right).
 * Content index 0 (newest) starts centered at progress 0.
 */
export function getTimelineTrackTranslate(contentIndex: number, entryCount: number, viewportWidth: number) {
  if (entryCount <= 1) {
    return 0
  }

  const domIndex = entryCount - 1 - contentIndex
  if (domIndex === 0) {
    return 0
  }

  return -domIndex * viewportWidth
}

/** Returns snap-anchor top offset in viewport-height units. */
export function getTimelineSnapAnchorTopVh(index: number) {
  return index * 100
}
