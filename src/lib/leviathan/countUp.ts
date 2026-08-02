/**
 * Pure easing/count-up math for the Leviathan headline stats (issue #317).
 *
 * No timers, no DOM — `StatCounter.tsx` supplies the elapsed time (from its
 * own `requestAnimationFrame` loop) and this module says what number to
 * display. Kept separate from that component so the numeric behaviour is
 * testable without mounting React or faking rAF.
 */

/** Ease-out cubic: fast start, slow settle into the target. */
export function easeOutCubic(progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress))
  return 1 - Math.pow(1 - clamped, 3)
}

/**
 * The value to display `elapsedMs` into a `durationMs` count-up toward
 * `target`, eased and rounded to a whole number. Clamped at both ends: a
 * non-positive duration or an elapsed time past the duration both resolve
 * to `target` exactly, so a caller never has to special-case "done".
 */
export function countUpValue(target: number, elapsedMs: number, durationMs: number): number {
  if (durationMs <= 0) return target
  const progress = easeOutCubic(elapsedMs / durationMs)
  return Math.round(target * progress)
}
