import { useEffect, useRef, useState } from 'react'
import type { LeviathanStat } from '@/data/leviathan'
import { startAnimationFrameLoop } from '@/lib/animationFrameLoop'
import { countUpValue } from '@/lib/leviathan/countUp'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const COUNT_DURATION_MS = 900

interface StatCounterProps {
  stat: LeviathanStat
}

function targetShown(reducedMotion: boolean): boolean {
  return reducedMotion || typeof window === 'undefined' || typeof window.IntersectionObserver === 'undefined'
}

/**
 * One headline stat (latency, params, or positions trained). Counts up
 * from 0 to `stat.target` the first time it scrolls into view, via
 * `IntersectionObserver`.
 *
 * The animated digits are `aria-hidden` — the wrapping `group` carries
 * `stat.accessibleName`, the full final figure, at all times. That means
 * assistive tech always gets the real number immediately rather than
 * whatever the count-up happens to be mid-animation, and it is also what
 * makes this testable without driving rAF: the accessible name is stable
 * regardless of animation state.
 *
 * Reduced motion: the target is shown immediately, no observer is created,
 * no animation runs. jsdom has no `IntersectionObserver` at all (it is
 * `undefined`, not a stub) — the same "show the target immediately" path
 * covers that case too, so its absence never throws.
 */
export function StatCounter({ stat }: StatCounterProps) {
  const reducedMotion = usePrefersReducedMotion()
  const showFinal = targetShown(reducedMotion)
  const ref = useRef<HTMLDivElement>(null)
  const [animated, setAnimated] = useState(0)
  const displayed = showFinal ? stat.target : animated

  useEffect(() => {
    if (showFinal) return

    const node = ref.current
    if (!node) return

    let cancelLoop: (() => void) | undefined

    const startCountUp = () => {
      cancelLoop = startAnimationFrameLoop((elapsed) => {
        setAnimated(countUpValue(stat.target, elapsed, COUNT_DURATION_MS))
        return elapsed < COUNT_DURATION_MS
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startCountUp()
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0 },
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      cancelLoop?.()
    }
  }, [showFinal, stat])

  return (
    <div ref={ref} role="group" aria-label={stat.accessibleName} className="flex flex-col">
      <div aria-hidden="true" className="font-display leading-none text-fluid-xl text-fg">
        {displayed}
        <span className="ml-[3px] text-fluid-xs text-dim-2">{stat.suffix}</span>
      </div>
      <div className="mt-[7px] text-2xs tracking-[0.16em] text-dim-2">{stat.label}</div>
    </div>
  )
}
