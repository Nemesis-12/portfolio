import { useEffect, useRef } from 'react'

/**
 * Thin scroll-position indicator under the header (#312).
 *
 * Deliberate exception to state-driven rendering (see spec): its width
 * (and `aria-valuenow`) are written directly onto the DOM node inside a
 * `requestAnimationFrame` callback, bypassing React state entirely.
 * Scroll position changes far more often than anything else on this page
 * re-renders for, and routing it through `setState` would re-render the
 * whole subtree on every frame for a bar nothing else depends on. `ref` +
 * direct style write is the one place in this codebase that's
 * intentional.
 *
 * Scheduling matches the reference implementation: `scroll`/`resize`
 * listeners each schedule at most ONE pending `requestAnimationFrame` --
 * a guard flag blocks a second event from queuing a second frame while
 * one is already pending, and the guard resets inside the rAF callback
 * itself. This means the read (`scrollHeight`/`innerHeight`/`scrollY`)
 * and the write (style + aria) happen at most once per animation frame,
 * and never at all while the page is idle -- unlike a self-rescheduling
 * rAF loop, which would burn a frame every ~16ms forever regardless of
 * whether the user is scrolling.
 */
export function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const el = fillRef.current
      if (!el) return

      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0

      el.style.width = `${(ratio * 100).toFixed(2)}%`
      el.setAttribute('aria-valuenow', String(Math.round(ratio * 100)))
    }

    const onScrollOrResize = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    // Compute the initial width/value once on mount, so the bar is
    // correct before the first scroll/resize event fires.
    update()

    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="h-[2px] w-full bg-line">
      <div
        ref={fillRef}
        role="progressbar"
        aria-label="Scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="h-full w-0 bg-accent"
        style={{ willChange: 'width' }}
      />
    </div>
  )
}
