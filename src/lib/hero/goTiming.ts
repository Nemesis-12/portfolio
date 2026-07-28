/**
 * Pure timing curve for the hero Go board replay (issue #316).
 *
 * Maps elapsed wall-clock time to "what move should be on screen right
 * now" with a deliberate rhythm: slow through the opening, accelerating
 * through the middlegame, a full pause before move 78 (the move the game
 * turns on), fast through the endgame, then a hold at the final position
 * before fading out and looping.
 *
 * No DOM, no React, no timers -- this module only computes numbers. The
 * component subscribes to a single `requestAnimationFrame` loop and calls
 * `frameAtElapsed` on every tick; everything about *when* a move appears
 * lives here, not scattered across `setTimeout` chains.
 *
 * These constants are a tuned starting point (see docs/spec-portfolio-
 * rewrite.md), not a measured result -- `LOOP_MS` lands close to the
 * spec's ~30s target but the true feel can only be judged in a browser.
 */

export const TOTAL_MOVES = 180
export const MOVE_78 = 78

/** Opening: the first 10 moves are placed slowly, one every 400ms. */
const OPENING_END = 10
const OPENING_DELAY_MS = 400

/** Middlegame: a linear ramp from the opening pace down to a fast pace. */
const MIDGAME_END = 60
const MIDGAME_START_DELAY_MS = 380
const MIDGAME_END_DELAY_MS = 95

/** Fast run-up to move 78. */
const FAST_MIDGAME_END = MOVE_78 - 1
const FAST_MIDGAME_DELAY_MS = 85

/** The deliberate pause before move 78 itself appears. */
const PRE_78_PAUSE_MS = 1300

/** Endgame: ramps from just after move 78 down to the fastest pace. */
const ENDGAME_RAMP_END = 140
const ENDGAME_START_DELAY_MS = 140
const ENDGAME_END_DELAY_MS = 65

/** The final, fastest stretch to move 180. */
const FINAL_DELAY_MS = 50

/** How long the finished position holds before the fade-out begins. */
export const HOLD_MS = 2600

/** How long the fade-out takes before the sequence loops. */
export const FADE_MS = 700

/**
 * How long a captured stone's exit animation takes. Matches the CSS
 * transition duration on a stone element (~550ms per the spec) so the
 * frame model knows how long to keep reporting a captured stone as
 * "leaving" rather than simply gone.
 */
export const CAPTURE_FADE_MS = 550

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

/**
 * The delay (ms) between the previous move appearing and `moveNumber`
 * appearing. `moveNumber` is 1-indexed (1..TOTAL_MOVES).
 */
export function moveDelayMs(moveNumber: number): number {
  if (moveNumber === MOVE_78) return PRE_78_PAUSE_MS
  if (moveNumber <= OPENING_END) return OPENING_DELAY_MS
  if (moveNumber <= MIDGAME_END) {
    const t = (moveNumber - OPENING_END) / (MIDGAME_END - OPENING_END)
    return lerp(MIDGAME_START_DELAY_MS, MIDGAME_END_DELAY_MS, t)
  }
  if (moveNumber <= FAST_MIDGAME_END) return FAST_MIDGAME_DELAY_MS
  if (moveNumber <= ENDGAME_RAMP_END) {
    const t = (moveNumber - (MOVE_78 + 1)) / (ENDGAME_RAMP_END - (MOVE_78 + 1))
    return lerp(ENDGAME_START_DELAY_MS, ENDGAME_END_DELAY_MS, Math.max(0, t))
  }
  return FINAL_DELAY_MS
}

/** Precomputed cumulative timestamp (ms) at which each move appears. */
const MOVE_TIMESTAMPS: readonly number[] = (() => {
  const timestamps: number[] = []
  let cumulative = 0
  for (let moveNumber = 1; moveNumber <= TOTAL_MOVES; moveNumber++) {
    cumulative += moveDelayMs(moveNumber)
    timestamps.push(cumulative)
  }
  return timestamps
})()

/** The elapsed time (ms) at which `moveNumber` appears, from a cold start. */
export function moveTimestampMs(moveNumber: number): number {
  const clamped = Math.max(1, Math.min(TOTAL_MOVES, moveNumber))
  return MOVE_TIMESTAMPS[clamped - 1]
}

/** Total time (ms) to place all 180 moves, from a cold start. */
export const SEQUENCE_MS = moveTimestampMs(TOTAL_MOVES)

/** Total loop length (ms): the sequence, plus the hold, plus the fade. */
export const LOOP_MS = SEQUENCE_MS + HOLD_MS + FADE_MS

export type SequencePhase = 'playing' | 'holding' | 'fading'

export interface TimingFrame {
  /**
   * The move currently on screen: 0..TOTAL_MOVES. 0 means the board is
   * still empty -- the sequence has started but the first move's initial
   * delay has not yet elapsed.
   */
  readonly moveNumber: number
  readonly phase: SequencePhase
  /** Time (ms) since `moveNumber` appeared -- drives the capture fade. */
  readonly elapsedSinceMove: number
  /** Elapsed time (ms), wrapped to a single loop -- drives the fade-out. */
  readonly loopElapsed: number
}

/** Counts how many moves have appeared by time `t` (ms), 0..TOTAL_MOVES. */
function moveNumberAtTime(t: number): number {
  let moveNumber = 0
  for (let n = 1; n <= TOTAL_MOVES; n++) {
    if (MOVE_TIMESTAMPS[n - 1] > t) break
    moveNumber = n
  }
  return moveNumber
}

/**
 * The single entry point the component calls every animation frame: given
 * total elapsed time since the sequence started (which may exceed one
 * loop), returns what should be on screen right now.
 */
export function frameAtElapsed(elapsedMs: number): TimingFrame {
  const wrapped = ((elapsedMs % LOOP_MS) + LOOP_MS) % LOOP_MS

  if (wrapped < SEQUENCE_MS) {
    const moveNumber = moveNumberAtTime(wrapped)
    const previousTimestamp = moveNumber > 0 ? MOVE_TIMESTAMPS[moveNumber - 1] : 0
    return {
      moveNumber,
      phase: 'playing',
      elapsedSinceMove: wrapped - previousTimestamp,
      loopElapsed: wrapped,
    }
  }

  if (wrapped < SEQUENCE_MS + HOLD_MS) {
    return {
      moveNumber: TOTAL_MOVES,
      phase: 'holding',
      elapsedSinceMove: wrapped - SEQUENCE_MS,
      loopElapsed: wrapped,
    }
  }

  return {
    moveNumber: TOTAL_MOVES,
    phase: 'fading',
    elapsedSinceMove: wrapped - SEQUENCE_MS - HOLD_MS,
    loopElapsed: wrapped,
  }
}
