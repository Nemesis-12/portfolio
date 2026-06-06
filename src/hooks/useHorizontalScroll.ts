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

function getHorizontalTranslate(
  inner: HTMLElement | null,
  progress: number,
  viewportWidth: number,
): number {
  if (!inner) {
    return 0
  }

  const carouselViewportWidth = getProjectsCarouselViewportWidth(viewportWidth)
  const trackWidth = Math.max(inner.scrollWidth - carouselViewportWidth, 0)
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
