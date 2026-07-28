/**
 * Pure one-shot typewriter timing for the hero tagline (issue #316).
 *
 * Replaces the old site's rotating role typewriter: this types a single
 * line once, then stops -- no deletion, no looping. Deliberately tiny and
 * separated from `goTiming`/`goFrameModel` (which drive the board) so the
 * tagline's timing can be reasoned about and tested on its own.
 */

export const DEFAULT_MS_PER_CHAR = 45

/** How many characters of `text` should be visible after `elapsedMs`. */
export function typedLength(text: string, elapsedMs: number, msPerChar = DEFAULT_MS_PER_CHAR): number {
  if (elapsedMs <= 0) return 0
  const chars = Math.floor(elapsedMs / msPerChar)
  return Math.max(0, Math.min(text.length, chars))
}

/** The visible substring of `text` after `elapsedMs`. */
export function typedText(text: string, elapsedMs: number, msPerChar = DEFAULT_MS_PER_CHAR): string {
  return text.slice(0, typedLength(text, elapsedMs, msPerChar))
}

/** Whether the whole line has finished typing by `elapsedMs`. */
export function isTypingDone(text: string, elapsedMs: number, msPerChar = DEFAULT_MS_PER_CHAR): boolean {
  return typedLength(text, elapsedMs, msPerChar) >= text.length
}
