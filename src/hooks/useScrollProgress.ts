import { useEffect, useRef, useState, type RefObject } from 'react'
import { clamp01 } from '../utils/math'

export interface ScrollProgressGeometry {
  sectionTop: number
  sectionHeight: number
  viewportHeight: number
}

export interface ScrollProgressOptions {
  getScrollRangePx?: (geometry: ScrollProgressGeometry) => number
}

const DEFAULT_SCROLL_PROGRESS_OPTIONS: ScrollProgressOptions = {}

export interface ScrollProgressState {
  progress: number
  viewportWidth: number
  viewportHeight: number
}

export function computeScrollProgress(
  outer: HTMLElement | null,
  options: ScrollProgressOptions = DEFAULT_SCROLL_PROGRESS_OPTIONS,
): ScrollProgressState {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  if (!outer) {
    return { progress: 0, viewportWidth, viewportHeight }
  }

  const rect = outer.getBoundingClientRect()
  const defaultScrollRange = Math.max(rect.height - viewportHeight, 0)
  const scrollRange = options.getScrollRangePx
    ? Math.max(options.getScrollRangePx({
      sectionTop: rect.top,
      sectionHeight: rect.height,
      viewportHeight,
    }), 0)
    : defaultScrollRange
  const progress = scrollRange === 0 ? 0 : clamp01(-rect.top / scrollRange)

  return { progress, viewportWidth, viewportHeight }
}

export function useScrollProgress(
  outerRef: RefObject<HTMLElement | null>,
  options: ScrollProgressOptions = DEFAULT_SCROLL_PROGRESS_OPTIONS,
): ScrollProgressState {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [state, setState] = useState<ScrollProgressState>(() =>
    computeScrollProgress(outerRef.current, optionsRef.current),
  )

  useEffect(() => {
    const update = () => {
      setState(computeScrollProgress(outerRef.current, optionsRef.current))
    }

    update()

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [outerRef])

  return state
}
