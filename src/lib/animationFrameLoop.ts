/**
 * Shared `requestAnimationFrame` loop shape (issue #358).
 *
 * Three components (the hero Go board replay, the hero tagline typer, and
 * the leviathan stat counter) each hand-rolled the same effect: capture a
 * start timestamp on the first frame, compute elapsed time since then on
 * every subsequent frame, do some work with that elapsed value, and keep
 * rescheduling until told to stop or unmounted. This is that loop, factored
 * out once so the scheduling/timestamp/cleanup plumbing only has to be
 * gotten right in one place.
 *
 * `onTick` receives the elapsed time (ms) since the loop started and does
 * whatever per-frame work the caller needs (typically a `setState` call).
 * Returning `false` stops the loop after that tick (the callback will not
 * be invoked again); any other return value (including `undefined`, the
 * common case for a callback with no explicit return) keeps it going.
 *
 * This is a plain function, not a hook: callers decide when to start the
 * loop (some start it unconditionally from a mount effect, others start it
 * on demand from inside an `IntersectionObserver` callback) and are
 * responsible for their own reduced-motion gating before calling it. It
 * returns a cancel function, meant to be used directly as a React effect's
 * cleanup return value.
 */
export function startAnimationFrameLoop(onTick: (elapsedMs: number) => boolean | void): () => void {
  let frameId: number
  let start: number | null = null

  const tick = (timestamp: number) => {
    if (start === null) start = timestamp
    const elapsed = timestamp - start
    const shouldContinue = onTick(elapsed) !== false
    if (shouldContinue) {
      frameId = requestAnimationFrame(tick)
    }
  }

  frameId = requestAnimationFrame(tick)

  return () => cancelAnimationFrame(frameId)
}
