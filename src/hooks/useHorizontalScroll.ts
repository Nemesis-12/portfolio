import { useEffect, useState, type RefObject } from 'react'
import { DEAD_ZONE_VIEWPORT_RATIO } from '../components/projectsGeometry'

interface HorizontalScrollState {
  tx: number
  progress: number
}

export function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

export function applyDeadZones(rawProgress: number, deadZoneProgress: number) {
  if (deadZoneProgress <= 0) {
    return rawProgress
  }

  if (rawProgress <= deadZoneProgress) {
    return 0
  }

  if (rawProgress >= 1 - deadZoneProgress) {
    return 1
  }

  return (rawProgress - deadZoneProgress) / (1 - deadZoneProgress * 2)
}

function getHorizontalScrollState(
  outer: HTMLElement | null,
  inner: HTMLElement | null,
): HorizontalScrollState {
  if (!outer || !inner) {
    return { tx: 0, progress: 0 }
  }

  const rect = outer.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const scrollRange = Math.max(rect.height - viewportHeight, 0)
  const rawProgress = scrollRange === 0 ? 0 : clamp01(-rect.top / scrollRange)
  const deadZoneProgress = scrollRange === 0 ? 0 : (viewportHeight * DEAD_ZONE_VIEWPORT_RATIO) / scrollRange
  const progress = clamp01(applyDeadZones(rawProgress, deadZoneProgress))
  const trackWidth = Math.max(inner.scrollWidth - viewportWidth, 0)
  const tx = progress === 0 || trackWidth === 0 ? 0 : -(progress * trackWidth)

  return {
    progress,
    tx,
  }
}

export function useHorizontalScroll(
  outerRef: RefObject<HTMLElement>,
  innerRef: RefObject<HTMLElement>,
): HorizontalScrollState {
  const [state, setState] = useState<HorizontalScrollState>({ tx: 0, progress: 0 })

  useEffect(() => {
    const update = () => {
      setState(getHorizontalScrollState(outerRef.current, innerRef.current))
    }

    update()

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [outerRef, innerRef])

  return state
}
