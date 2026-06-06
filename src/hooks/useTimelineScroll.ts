import { useMemo, type RefObject } from 'react'
import {
  getTimelineActiveIndex,
  getTimelineTrackTranslate,
} from '../components/timelineGeometry'
import { useScrollProgress } from './useScrollProgress'

interface TimelineScrollState {
  active: boolean[]
  activeIndex: number
  progress: number
  tx: number
}

function getTimelineScrollState(
  outer: HTMLElement | null,
  entryCount: number,
  progress: number,
  viewportWidth: number,
): TimelineScrollState {
  if (entryCount === 0) {
    return { active: [], activeIndex: 0, progress: 0, tx: 0 }
  }

  if (!outer) {
    return {
      active: Array.from({ length: entryCount }, (_, index) => index === 0),
      activeIndex: 0,
      progress: 0,
      tx: getTimelineTrackTranslate(0, entryCount, viewportWidth),
    }
  }

  const activeIndex = getTimelineActiveIndex(progress, entryCount)
  const tx = getTimelineTrackTranslate(activeIndex, entryCount, viewportWidth)
  const active = Array.from({ length: entryCount }, (_, index) => index === activeIndex)

  return { active, activeIndex, progress, tx }
}

export function useTimelineScroll(
  outerRef: RefObject<HTMLElement | null>,
  entryCount: number,
): TimelineScrollState {
  const { progress, viewportWidth } = useScrollProgress(outerRef)

  return useMemo(
    () => getTimelineScrollState(outerRef.current, entryCount, progress, viewportWidth),
    [outerRef, entryCount, progress, viewportWidth],
  )
}

export default useTimelineScroll
