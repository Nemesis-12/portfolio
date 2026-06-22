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
    let frameId: number | null = null
    let framePending = false

    const update = () => {
      setState(computeScrollProgress(outerRef.current, optionsRef.current))
    }

    const requestUpdate = () => {
      if (framePending) {
        return
      }

      framePending = true
      frameId = window.requestAnimationFrame(() => {
        framePending = false
        frameId = null
        update()
      })
    }

    update()

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [outerRef])

  return state
}
