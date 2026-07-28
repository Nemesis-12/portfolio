/**
 * Pure Go rules engine: given a move list, produces the board state after
 * each move with captures resolved by group liberty detection.
 *
 * No DOM, no React, no timers — this module only computes data. It is the
 * correctness core the Game 4 hero board depends on: playing 180 real
 * moves append-only (with no capture resolution) produces a board
 * position that never existed, cluttered with stones that were actually
 * captured during the game.
 */

export const BOARD_SIZE = 19

export type Color = 'B' | 'W'

export type Stone = Color | null

export interface Position {
  readonly row: number
  readonly col: number
}

export type Board = readonly (readonly Stone[])[]

export interface Move {
  readonly color: Color
  readonly position: Position
}

export interface MoveResult {
  readonly board: Board
  readonly captured: readonly Position[]
}

export interface BoardState {
  readonly moveNumber: number
  readonly move: Move
  readonly board: Board
  readonly captured: readonly Position[]
}

/** A fresh 19x19 board with every point empty. */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<Stone>(BOARD_SIZE).fill(null))
}

function opponentOf(color: Color): Color {
  return color === 'B' ? 'W' : 'B'
}

function isOnBoard(position: Position): boolean {
  return (
    position.row >= 0 &&
    position.row < BOARD_SIZE &&
    position.col >= 0 &&
    position.col < BOARD_SIZE
  )
}

function neighborsOf(position: Position): Position[] {
  const candidates: Position[] = [
    { row: position.row - 1, col: position.col },
    { row: position.row + 1, col: position.col },
    { row: position.row, col: position.col - 1 },
    { row: position.row, col: position.col + 1 },
  ]
  return candidates.filter(isOnBoard)
}

function positionKey(position: Position): string {
  return `${position.row},${position.col}`
}

interface Group {
  readonly stones: readonly Position[]
  readonly libertyCount: number
}

/** Flood-fills the group of same-colour stones connected to `start`. */
function findGroup(board: Stone[][], start: Position): Group {
  const color = board[start.row][start.col]
  const visited = new Set<string>([positionKey(start)])
  const stones: Position[] = [start]
  const liberties = new Set<string>()
  const stack: Position[] = [start]

  while (stack.length > 0) {
    // Non-null: the loop only pushes positions it just read from the stack.
    const current = stack.pop() as Position
    for (const neighbor of neighborsOf(current)) {
      const stone = board[neighbor.row][neighbor.col]
      if (stone === null) {
        liberties.add(positionKey(neighbor))
      } else if (stone === color && !visited.has(positionKey(neighbor))) {
        visited.add(positionKey(neighbor))
        stones.push(neighbor)
        stack.push(neighbor)
      }
    }
  }

  return { stones, libertyCount: liberties.size }
}

function removeGroup(board: Stone[][], stones: readonly Position[]): void {
  for (const stone of stones) {
    board[stone.row][stone.col] = null
  }
}

/**
 * Applies a single move to a board, resolving captures by group liberty
 * detection.
 *
 * Order matters: opponent groups left with zero liberties are removed
 * first. Only then is the placed stone's own group re-checked — if it is
 * left with zero liberties (self-capture / suicide), it is removed too.
 * This ordering means a move that fills what looks like its own last
 * liberty is not a self-capture when it simultaneously captures an
 * opponent group that frees one.
 *
 * Pure: returns a new board, never mutates the one passed in.
 */
export function applyMove(board: Board, move: Move): MoveResult {
  if (!isOnBoard(move.position)) {
    throw new Error(`Move position out of bounds: ${JSON.stringify(move.position)}`)
  }
  if (board[move.position.row][move.position.col] !== null) {
    throw new Error(`Position already occupied: ${JSON.stringify(move.position)}`)
  }

  const next: Stone[][] = board.map((row) => row.slice())
  next[move.position.row][move.position.col] = move.color

  const captured: Position[] = []
  const opponent = opponentOf(move.color)
  const checkedOpponentStones = new Set<string>()

  for (const neighbor of neighborsOf(move.position)) {
    if (next[neighbor.row][neighbor.col] !== opponent) continue
    if (checkedOpponentStones.has(positionKey(neighbor))) continue

    const group = findGroup(next, neighbor)
    for (const stone of group.stones) checkedOpponentStones.add(positionKey(stone))

    if (group.libertyCount === 0) {
      removeGroup(next, group.stones)
      captured.push(...group.stones)
    }
  }

  const ownGroup = findGroup(next, move.position)
  if (ownGroup.libertyCount === 0) {
    removeGroup(next, ownGroup.stones)
    captured.push(...ownGroup.stones)
  }

  return { board: next, captured }
}

/**
 * Folds a move list into the sequence of board states produced by playing
 * it out from an empty board, one entry per move, captures resolved at
 * each step.
 */
export function computeBoardStates(moves: readonly Move[]): BoardState[] {
  const states: BoardState[] = []
  let board = createEmptyBoard()

  for (const [index, move] of moves.entries()) {
    const result = applyMove(board, move)
    board = result.board
    states.push({
      moveNumber: index + 1,
      move,
      board,
      captured: result.captured,
    })
  }

  return states
}
