import { useMemo, type RefObject } from 'react'
import { getProjectsCarouselViewportWidth } from '../components/projectsGeometry'
import { useScrollProgress } from './useScrollProgress'

interface HorizontalScrollState {
  tx: number
  progress: number
}

interface HorizontalScrollOptions {
  getScrollRangePx?: (geometry: {
    sectionTop: number
    sectionHeight: number
    viewportHeight: number
  }) => number
}

const DEFAULT_HORIZONTAL_SCROLL_OPTIONS: HorizontalScrollOptions = {}

/**
 * Returns the inner track's true content width.
 *
 * `inner.scrollWidth` is unreliable here: Chromium under-reports it for a flex row that has
 * `align-items: center` (needed to vertically center the cards) together with `flex-shrink: 0`
 * children that overflow the main axis — confirmed by comparing against the first/last child's
 * own bounding rects, which stay correct regardless of `align-items`. Measuring from the first
 * and last child's rects sidesteps the quirk and still reflects the actual rendered card width
 * at any viewport size (including the `min(560px, 78vw)` clamp on narrow viewports).
 */
function getInnerContentWidth(inner: HTMLElement): number {
  const first = inner.firstElementChild
  const last = inner.lastElementChild
  if (!first || !last) {
    return inner.scrollWidth
  }

  return last.getBoundingClientRect().right - first.getBoundingClientRect().left
}

function getHorizontalTranslate(
  inner: HTMLElement | null,
  progress: number,
  viewportWidth: number,
): number {
  if (!inner) {
    return 0
  }

  const carouselViewportWidth = getProjectsCarouselViewportWidth(viewportWidth)
  const trackWidth = Math.max(getInnerContentWidth(inner) - carouselViewportWidth, 0)
  return progress === 0 || trackWidth === 0 ? 0 : -(progress * trackWidth)
}

export function useHorizontalScroll(
  outerRef: RefObject<HTMLElement>,
  innerRef: RefObject<HTMLElement>,
  options: HorizontalScrollOptions = DEFAULT_HORIZONTAL_SCROLL_OPTIONS,
): HorizontalScrollState {
  const { progress, viewportWidth } = useScrollProgress(outerRef, options)

  const tx = useMemo(
    () => getHorizontalTranslate(innerRef.current, progress, viewportWidth),
    [innerRef, progress, viewportWidth],
  )

  return { progress, tx }
}
