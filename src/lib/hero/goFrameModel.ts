/**
 * Pure frame-to-model logic for the hero Go board (issue #316): given a
 * move number and the loop's wall-clock elapsed time, produces the set of
 * stones to render and their visual state.
 *
 * This is the "model" half of the frame-to-model split: `goTiming.ts`
 * turns elapsed time into a move number, and this module turns a move
 * number into what the board actually looks like. The board states
 * themselves come from the real Go rules engine (`@/lib/go/board`) applied
 * to the real Game 4 move list -- captures are resolved once, here, by
 * that engine, not re-derived or approximated.
 *
 * Capture exit-fades are keyed to wall-clock `loopElapsed`, not to "time
 * since the current move appeared": a fade started on one move must keep
 * rendering while later moves arrive, so it is tracked against its own
 * capture timestamp rather than against whatever move is current. See
 * `CAPTURE_EVENTS` / `activeFadeAt`.
 *
 * No DOM, no React, no timers.
 */
import { GAME4_MOVES } from '@/data/game4Moves'
import {
  BOARD_SIZE,
  computeBoardStates,
  createEmptyBoard,
  type Board,
  type BoardState,
  type Color,
  type Position,
} from '@/lib/go/board'
import { CAPTURE_FADE_MS, MOVE_78, TOTAL_MOVES, moveTimestampMs } from './goTiming'

/** The board state after each of the 180 real Game 4 moves, captures resolved. */
export const GAME4_BOARD_STATES: readonly BoardState[] = computeBoardStates(
  GAME4_MOVES.map((move) => ({ color: move.color, position: move.position })),
)

/** Where move 78 -- Lee Sedol's wedge, the move the game turns on -- was played. */
export const MOVE_78_POSITION: Position = GAME4_MOVES[MOVE_78 - 1].position

/**
 * The most recent move number, as of move `n`, that placed a stone at the
 * move-78 point. Tracked separately from board occupancy so the move-78
 * emphasis can be keyed to *that specific stone*, not to "whatever is
 * currently sitting on that coordinate" -- the point is captured (move 91)
 * and, in principle, could be played into again later by either colour.
 * Index `n - 1` holds the value as of move `n`; `0` means never played.
 */
const LATEST_PLAY_AT_MOVE_78_POSITION: readonly number[] = (() => {
  const result: number[] = []
  let latest = 0
  for (let n = 1; n <= TOTAL_MOVES; n++) {
    const move = GAME4_MOVES[n - 1]
    if (move.position.row === MOVE_78_POSITION.row && move.position.col === MOVE_78_POSITION.col) {
      latest = n
    }
    result.push(latest)
  }
  return result
})()

export type StoneVariant = 'stone' | 'move78' | 'leaving'

export interface StoneView {
  /** Stable per-position key so React can key stones across frames. */
  readonly key: string
  readonly row: number
  readonly col: number
  readonly color: Color
  readonly variant: StoneVariant
}

export interface BoardFrame {
  /** 0..TOTAL_MOVES; 0 means the board is still empty. */
  readonly moveNumber: number
  readonly stones: readonly StoneView[]
  /**
   * Where move 78 was played, once it has happened -- present even after
   * that stone is captured (move 91, in the real game), so the point that
   * decided the game stays marked. `null` before move 78.
   */
  readonly move78Marker: Position | null
}

function boardAt(moveNumber: number): Board {
  if (moveNumber <= 0) return createEmptyBoard()
  const clamped = Math.min(moveNumber, TOTAL_MOVES)
  return GAME4_BOARD_STATES[clamped - 1].board
}

/**
 * True if the stone currently occupying the move-78 point is *the* move-78
 * stone -- i.e. no later move has been played onto that coordinate since
 * (which would only be possible after it was captured). Keys the emphasis
 * to the specific stone's identity rather than to the coordinate, so a
 * hypothetical future replay onto that point would not be mistaken for it.
 */
function isCurrentMove78Stone(clamped: number, row: number, col: number): boolean {
  if (row !== MOVE_78_POSITION.row || col !== MOVE_78_POSITION.col) return false
  return LATEST_PLAY_AT_MOVE_78_POSITION[clamped - 1] === MOVE_78
}

interface CaptureEvent {
  readonly moveNumber: number
  readonly row: number
  readonly col: number
  readonly color: Color
}

/**
 * Every stone capture across the real Game 4 replay, flattened into a
 * single ordered list, each tagged with the move number it happened on and
 * the colour that was removed. Precomputed once so `frameForMove` (called
 * every animation frame) doesn't re-derive capture history per call.
 */
const CAPTURE_EVENTS: readonly CaptureEvent[] = (() => {
  const events: CaptureEvent[] = []
  for (let moveNumber = 1; moveNumber <= TOTAL_MOVES; moveNumber++) {
    const state = GAME4_BOARD_STATES[moveNumber - 1]
    if (state.captured.length === 0) continue
    const previousBoard = boardAt(moveNumber - 1)
    for (const position of state.captured) {
      const color = previousBoard[position.row][position.col]
      if (color === null) continue
      events.push({ moveNumber, row: position.row, col: position.col, color })
    }
  }
  return events
})()

/**
 * Whether a capture event is still within its exit-animation window at
 * `loopElapsedMs` (wall-clock time since the loop began, from
 * `goTiming.frameAtElapsed`'s `loopElapsed`) -- i.e. `0 <= elapsed <
 * CAPTURE_FADE_MS` measured from *that event's own* move timestamp, not
 * from whatever move happens to be current. This is what lets a fade
 * started at, say, move 176 keep rendering while moves 177-179 arrive:
 * each fade's clock is independent of the "current move" concept.
 */
function activeFadeAt(event: CaptureEvent, loopElapsedMs: number): boolean {
  const elapsed = loopElapsedMs - moveTimestampMs(event.moveNumber)
  return elapsed >= 0 && elapsed < CAPTURE_FADE_MS
}

/**
 * True if any capture anywhere in the replay is currently mid-fade at
 * `loopElapsedMs`. Exposed so the component can skip redundant re-renders
 * (SHOULD-FIX #4) without ever skipping one that would actually change
 * what's on screen -- a currently-open fade is exactly the case where
 * "nothing new happened" can still mean "something is still animating".
 */
export function hasActiveCaptureFade(loopElapsedMs: number): boolean {
  return CAPTURE_EVENTS.some((event) => activeFadeAt(event, loopElapsedMs))
}

/**
 * The board frame for `moveNumber`, including any captured stones -- from
 * this move or any earlier one in the same loop -- still within their own
 * exit-animation window. `loopElapsedMs` is wall-clock time since the loop
 * began (`goTiming.frameAtElapsed`'s `loopElapsed`), which is what lets a
 * fade started several moves back keep rendering as 'leaving' right up to
 * its own `CAPTURE_FADE_MS` deadline, independent of the current move.
 *
 * Pass a large `loopElapsedMs` (or omit it) for a frame with no "leaving"
 * stones -- e.g. the static final frame shown under reduced motion, where
 * nothing should be mid-animation.
 */
export function frameForMove(
  moveNumber: number,
  loopElapsedMs = Number.POSITIVE_INFINITY,
): BoardFrame {
  const clamped = Math.max(0, Math.min(moveNumber, TOTAL_MOVES))
  const board = boardAt(clamped)

  const stones: StoneView[] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const color = board[row][col]
      if (color === null) continue
      const variant: StoneVariant =
        clamped >= MOVE_78 && isCurrentMove78Stone(clamped, row, col) ? 'move78' : 'stone'
      stones.push({ key: `${row}-${col}`, row, col, color, variant })
    }
  }

  for (const event of CAPTURE_EVENTS) {
    if (!activeFadeAt(event, loopElapsedMs)) continue
    // Stable key for the event's whole fade window -- not the current
    // move -- so React keeps the same DOM node (and its CSS transition)
    // alive across the moves that arrive while it fades out.
    stones.push({
      key: `leaving-${event.row}-${event.col}-${event.moveNumber}`,
      row: event.row,
      col: event.col,
      color: event.color,
      variant: 'leaving',
    })
  }

  return {
    moveNumber: clamped,
    stones,
    move78Marker: clamped >= MOVE_78 ? MOVE_78_POSITION : null,
  }
}

/**
 * The final position, drawn with no animation in progress -- used for the
 * reduced-motion static board (move 78 marked, nothing mid-capture-fade).
 */
export function staticFinalFrame(): BoardFrame {
  return frameForMove(TOTAL_MOVES)
}
