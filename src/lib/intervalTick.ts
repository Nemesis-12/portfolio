/**
 * Shared `setInterval` tick shape (issue #358).
 *
 * Three components (the header clock, the leviathan inference pipeline,
 * and the "other projects" agent cluster) each hand-rolled the same
 * effect: start a `setInterval` on mount, tick a callback every `delayMs`,
 * and `clearInterval` on unmount. This is that effect, factored out once.
 *
 * A plain function rather than a hook, matching `startAnimationFrameLoop`:
 * callers invoke it from inside their own effect, after their own
 * reduced-motion gate, and return the cancel function as that effect's
 * cleanup.
 */
export function startIntervalTick(callback: () => void, delayMs: number): () => void {
  const id = setInterval(callback, delayMs)
  return () => clearInterval(id)
}
