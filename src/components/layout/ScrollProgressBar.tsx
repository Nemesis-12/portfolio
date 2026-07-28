import { useEffect, useRef } from 'react'

/**
 * Thin scroll-position indicator under the header (#312).
 *
 * Deliberate exception to state-driven rendering (see spec): its width is
 * written directly onto the DOM node inside a `requestAnimationFrame`
 * loop, bypassing React state entirely. Scroll position changes far more
 * often than anything else on this page re-renders for, and routing it
 * through `setState` would re-render the whole subtree on every frame
 * for a bar nothing else depends on. `ref` + direct style write is the
 * one place in this codebase that's intentional.
 */
export function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame: number

    const tick = () => {
      const el = fillRef.current
      if (el) {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
        const ratio = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0
        el.style.width = `${(ratio * 100).toFixed(2)}%`
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="h-[2px] w-full bg-line" aria-hidden="true">
      <div
        ref={fillRef}
        data-testid="scroll-progress-fill"
        className="h-full w-0 bg-accent"
        style={{ willChange: 'width' }}
      />
    </div>
  )
}
