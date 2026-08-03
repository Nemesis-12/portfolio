import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { isTypingDone, typedText } from '@/lib/hero/typewriter'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

interface HeroTaglineProps {
  text: string
  className?: string
}

/**
 * The one-shot tagline typer (issue #316): types `text` once on mount,
 * then stops. Replaces the old site's rotating role typewriter.
 *
 * Under reduced motion, the full text renders immediately -- no timer, no
 * partial reveal -- and the cursor after it holds steady rather than
 * blinking (the blink keyframe itself is scoped to `prefers-reduced-
 * motion: no-preference` in src/styles/hero.css, so it simply doesn't run
 * here; this component doesn't need to know the mechanism, only that it
 * shouldn't start a reveal timer).
 */
export function HeroTagline({ text, className }: HeroTaglineProps) {
  const reducedMotion = usePrefersReducedMotion()
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (reducedMotion) return undefined
    if (isTypingDone(text, 0)) return undefined

    startRef.current = null
    let frameId: number

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const next = timestamp - startRef.current
      setElapsed(next)
      if (!isTypingDone(text, next)) {
        frameId = requestAnimationFrame(tick)
      }
    }
    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
    // Runs once per mount / per reduced-motion change; `text` is static content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  const visible = reducedMotion ? text : typedText(text, elapsed)

  return (
    <p className={cn('min-h-[1.6em]', className)}>
      {visible}
      {/*
       * Sample line 306: `.5em` wide, `1em` tall, `vertical-align:-.12em`,
       * `margin-left:.12em`, `background:var(--accent)`. Tailwind has no
       * bare `align-[...]` utility for `vertical-align`, so it's set via
       * the arbitrary-property escape hatch.
       */}
      <span
        aria-hidden="true"
        className="hero-cursor ml-[0.12em] inline-block h-[1em] w-[0.5em] bg-accent [vertical-align:-.12em]"
      />
    </p>
  )
}
