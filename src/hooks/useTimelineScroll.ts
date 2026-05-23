import { useEffect, useState, type RefObject } from 'react'
import {
  getTimelineActiveIndex,
  getTimelineScrollProgress,
  getTimelineTrackTranslate,
} from '../components/timelineGeometry'

interface TimelineScrollState {
  active: boolean[]
  activeIndex: number
  progress: number
  tx: number
}

function getTimelineScrollState(
  outer: HTMLElement | null,
  entryCount: number,
): TimelineScrollState {
  if (entryCount === 0) {
    return { active: [], activeIndex: 0, progress: 0, tx: 0 }
  }

  if (!outer) {
    return {
      active: Array.from({ length: entryCount }, (_, index) => index === 0),
      activeIndex: 0,
      progress: 0,
      tx: getTimelineTrackTranslate(0, entryCount, window.innerWidth),
    }
  }

  const rect = outer.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const progress = getTimelineScrollProgress(rect.top, rect.height, viewportHeight)
  const activeIndex = getTimelineActiveIndex(progress, entryCount)
  const tx = getTimelineTrackTranslate(activeIndex, entryCount, viewportWidth)
  const active = Array.from({ length: entryCount }, (_, index) => index === activeIndex)

  return { active, activeIndex, progress, tx }
}

export function useTimelineScroll(
  outerRef: RefObject<HTMLElement | null>,
  entryCount: number,
): TimelineScrollState {
  const [state, setState] = useState<TimelineScrollState>(() =>
    getTimelineScrollState(outerRef.current, entryCount),
  )

  useEffect(() => {
    const update = () => {
      setState(getTimelineScrollState(outerRef.current, entryCount))
    }

    update()

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [outerRef, entryCount])

  return state
}

export default useTimelineScroll
