/**
 * Pure frame-to-model logic for the hero Go board (issue #316): given a
 * move number (and how long ago it appeared), produces the set of stones
 * to render and their visual state.
 *
 * This is the "model" half of the frame-to-model split: `goTiming.ts`
 * turns elapsed time into a move number, and this module turns a move
 * number into what the board actually looks like. The board states
 * themselves come from the real Go rules engine (`@/lib/go/board`) applied
 * to the real Game 4 move list -- captures are resolved once, here, by
 * that engine, not re-derived or approximated.
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
import { CAPTURE_FADE_MS, MOVE_78, TOTAL_MOVES } from './goTiming'

/** The board state after each of the 180 real Game 4 moves, captures resolved. */
export const GAME4_BOARD_STATES: readonly BoardState[] = computeBoardStates(
  GAME4_MOVES.map((move) => ({ color: move.color, position: move.position })),
)

/** Where move 78 -- Lee Sedol's wedge, the move the game turns on -- was played. */
export const MOVE_78_POSITION: Position = GAME4_MOVES[MOVE_78 - 1].position

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

function stateAt(moveNumber: number): BoardState | null {
  if (moveNumber <= 0 || moveNumber > TOTAL_MOVES) return null
  return GAME4_BOARD_STATES[moveNumber - 1]
}

function isMove78Position(row: number, col: number): boolean {
  return row === MOVE_78_POSITION.row && col === MOVE_78_POSITION.col
}

/**
 * The board frame for `moveNumber`, including any just-captured stones
 * still within their exit-animation window (`elapsedSinceMoveMs` since
 * that move appeared, from `goTiming.frameAtElapsed`).
 *
 * Pass a large `elapsedSinceMoveMs` (or omit it) for a frame with no
 * "leaving" stones -- e.g. the static final frame shown under reduced
 * motion, where nothing should be mid-animation.
 */
export function frameForMove(
  moveNumber: number,
  elapsedSinceMoveMs = Number.POSITIVE_INFINITY,
): BoardFrame {
  const clamped = Math.max(0, Math.min(moveNumber, TOTAL_MOVES))
  const board = boardAt(clamped)

  const stones: StoneView[] = []
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const color = board[row][col]
      if (color === null) continue
      const variant: StoneVariant =
        clamped >= MOVE_78 && isMove78Position(row, col) ? 'move78' : 'stone'
      stones.push({ key: `${row}-${col}`, row, col, color, variant })
    }
  }

  const currentState = stateAt(clamped)
  if (currentState && currentState.captured.length > 0 && elapsedSinceMoveMs < CAPTURE_FADE_MS) {
    const previousBoard = boardAt(clamped - 1)
    for (const position of currentState.captured) {
      const color = previousBoard[position.row][position.col]
      if (color === null) continue
      stones.push({
        key: `leaving-${position.row}-${position.col}-${clamped}`,
        row: position.row,
        col: position.col,
        color,
        variant: 'leaving',
      })
    }
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
