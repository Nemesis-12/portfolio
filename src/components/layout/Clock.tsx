import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
import { cn } from '@/lib/cn'

function formatClock(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * Live header clock (#312).
 *
 * "Settles rather than flickers" under `prefers-reduced-motion: reduce`
 * means concretely: the per-second tick is never started at all. The
 * clock renders the time once, at mount, and then holds -- it does not
 * keep re-rendering a changing value, and the accent cursor next to it
 * stops blinking and sits solid. A visitor who has asked for less motion
 * gets a clock that reads as "the time", not a widget that updates in
 * front of them every second.
 */
export function Clock() {
  const reducedMotion = usePrefersReducedMotion()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (reducedMotion) return

    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [reducedMotion])

  const label = formatClock(now)

  return (
    <span className="flex items-center gap-[7px] text-[10.5px] tracking-[0.1em] text-dim-2">
      <span aria-hidden="true">{label}</span>
      <span className="sr-only">Current time {label}</span>
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-[10px] w-[6px] bg-accent',
          !reducedMotion && 'animate-header-cursor-blink',
        )}
      />
    </span>
  )
}
