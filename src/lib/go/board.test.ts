import { describe, expect, it } from 'vitest'
import { applyMove, computeBoardStates, createEmptyBoard, type Board, type Move } from './board'
import { GAME4_MOVES } from '@/data/game4Moves'

/** Plays a sequence of moves from an empty board, returning the final result. */
function play(moves: readonly Move[]): { board: Board; captured: readonly (readonly number[])[] } {
  let board = createEmptyBoard()
  let captured: { row: number; col: number }[] = []
  for (const move of moves) {
    const result = applyMove(board, move)
    board = result.board
    captured = [...result.captured]
  }
  return { board, captured: captured.map((p) => [p.row, p.col]) }
}

function stoneAt(board: Board, row: number, col: number): 'B' | 'W' | null {
  return board[row][col]
}

describe('applyMove', () => {
  it('places a stone on an empty point', () => {
    const { board } = applyMove(createEmptyBoard(), { color: 'B', position: { row: 3, col: 3 } })
    expect(stoneAt(board, 3, 3)).toBe('B')
  })

  it('rejects a move onto an occupied point', () => {
    const { board } = applyMove(createEmptyBoard(), { color: 'B', position: { row: 3, col: 3 } })
    expect(() => applyMove(board, { color: 'W', position: { row: 3, col: 3 } })).toThrow()
  })

  it('rejects a move outside the board', () => {
    expect(() =>
      applyMove(createEmptyBoard(), { color: 'B', position: { row: 19, col: 0 } }),
    ).toThrow()
  })

  it('never mutates the board passed in', () => {
    const before = createEmptyBoard()
    applyMove(before, { color: 'B', position: { row: 5, col: 5 } })
    expect(stoneAt(before, 5, 5)).toBeNull()
  })

  it('captures a single surrounded stone', () => {
    const { board, captured } = play([
      { color: 'B', position: { row: 5, col: 5 } },
      { color: 'W', position: { row: 4, col: 5 } },
      { color: 'W', position: { row: 6, col: 5 } },
      { color: 'W', position: { row: 5, col: 4 } },
      { color: 'W', position: { row: 5, col: 6 } }, // fills the last liberty
    ])

    expect(stoneAt(board, 5, 5)).toBeNull()
    expect(captured).toEqual([[5, 5]])
    // The capturing stones remain.
    expect(stoneAt(board, 4, 5)).toBe('W')
    expect(stoneAt(board, 6, 5)).toBe('W')
  })

  it('captures a multi-stone group as a unit', () => {
    const { board, captured } = play([
      { color: 'B', position: { row: 5, col: 5 } },
      { color: 'B', position: { row: 5, col: 6 } },
      { color: 'W', position: { row: 4, col: 5 } },
      { color: 'W', position: { row: 4, col: 6 } },
      { color: 'W', position: { row: 6, col: 5 } },
      { color: 'W', position: { row: 6, col: 6 } },
      { color: 'W', position: { row: 5, col: 4 } },
      { color: 'W', position: { row: 5, col: 7 } }, // fills the group's last liberty
    ])

    expect(stoneAt(board, 5, 5)).toBeNull()
    expect(stoneAt(board, 5, 6)).toBeNull()
    expect(captured).toHaveLength(2)
    expect(captured).toEqual(expect.arrayContaining([[5, 5], [5, 6]]))
  })

  it('captures a stone on the board edge, which has only three liberties', () => {
    const { board, captured } = play([
      { color: 'B', position: { row: 0, col: 5 } },
      { color: 'W', position: { row: 0, col: 4 } },
      { color: 'W', position: { row: 0, col: 6 } },
      { color: 'W', position: { row: 1, col: 5 } }, // fills the last liberty
    ])

    expect(stoneAt(board, 0, 5)).toBeNull()
    expect(captured).toEqual([[0, 5]])
  })

  it('captures a stone in the corner, which has only two liberties', () => {
    const { board, captured } = play([
      { color: 'B', position: { row: 0, col: 0 } },
      { color: 'W', position: { row: 0, col: 1 } },
      { color: 'W', position: { row: 1, col: 0 } }, // fills the last liberty
    ])

    expect(stoneAt(board, 0, 0)).toBeNull()
    expect(captured).toEqual([[0, 0]])
  })

  it('captures two separate groups simultaneously with one move', () => {
    const { board, captured } = play([
      { color: 'B', position: { row: 5, col: 4 } },
      { color: 'B', position: { row: 5, col: 6 } },
      { color: 'W', position: { row: 4, col: 4 } },
      { color: 'W', position: { row: 6, col: 4 } },
      { color: 'W', position: { row: 5, col: 3 } },
      { color: 'W', position: { row: 4, col: 6 } },
      { color: 'W', position: { row: 6, col: 6 } },
      { color: 'W', position: { row: 5, col: 7 } },
      // Both black groups now have exactly one shared liberty at (5, 5).
      { color: 'W', position: { row: 5, col: 5 } },
    ])

    expect(stoneAt(board, 5, 4)).toBeNull()
    expect(stoneAt(board, 5, 6)).toBeNull()
    expect(stoneAt(board, 5, 5)).toBe('W')
    expect(captured).toHaveLength(2)
    expect(captured).toEqual(expect.arrayContaining([[5, 4], [5, 6]]))
  })

  it('removes a stone that has no liberties after being placed (self-capture)', () => {
    // Black stones ring every side of (5, 5), each kept alive by an outer
    // liberty of its own, so only the white stone played into the middle
    // is left with none.
    const { board, captured } = play([
      { color: 'B', position: { row: 4, col: 5 } },
      { color: 'B', position: { row: 6, col: 5 } },
      { color: 'B', position: { row: 5, col: 4 } },
      { color: 'B', position: { row: 5, col: 6 } },
      { color: 'W', position: { row: 5, col: 5 } },
    ])

    expect(stoneAt(board, 5, 5)).toBeNull()
    expect(captured).toEqual([[5, 5]])
    // The surrounding black ring survives — it was never in atari.
    expect(stoneAt(board, 4, 5)).toBe('B')
    expect(stoneAt(board, 6, 5)).toBe('B')
    expect(stoneAt(board, 5, 4)).toBe('B')
    expect(stoneAt(board, 5, 6)).toBe('B')
  })

  it('captures an opponent group before checking its own group for suicide', () => {
    // White plays into a point surrounded by black on all four sides —
    // indistinguishable from the plain self-capture case above, except one
    // of those black neighbours (5,6) is a lone stone in atari, whose only
    // liberty is the point White is about to play. The capture must
    // resolve before the self-capture check, so White's stone survives
    // with the liberty it just freed up.
    const { board, captured } = play([
      { color: 'B', position: { row: 5, col: 6 } },
      { color: 'W', position: { row: 4, col: 6 } },
      { color: 'W', position: { row: 6, col: 6 } },
      { color: 'W', position: { row: 5, col: 7 } }, // B(5,6) now has one liberty: (5,5)
      { color: 'B', position: { row: 4, col: 5 } },
      { color: 'B', position: { row: 6, col: 5 } },
      { color: 'B', position: { row: 5, col: 4 } },
      { color: 'W', position: { row: 5, col: 5 } }, // captures B(5,6), survives
    ])

    expect(stoneAt(board, 5, 5)).toBe('W')
    expect(stoneAt(board, 5, 6)).toBeNull()
    expect(captured).toEqual([[5, 6]])
    // The other three black stones were never in atari and remain.
    expect(stoneAt(board, 4, 5)).toBe('B')
    expect(stoneAt(board, 6, 5)).toBe('B')
    expect(stoneAt(board, 5, 4)).toBe('B')
  })
})

describe('computeBoardStates', () => {
  it('produces one state per move', () => {
    const states = computeBoardStates([
      { color: 'B', position: { row: 0, col: 0 } },
      { color: 'W', position: { row: 1, col: 1 } },
    ])

    expect(states).toHaveLength(2)
    expect(states[0].moveNumber).toBe(1)
    expect(states[1].moveNumber).toBe(2)
  })

  it('carries captures forward so later states reflect resolved positions', () => {
    const states = computeBoardStates([
      { color: 'B', position: { row: 5, col: 5 } },
      { color: 'W', position: { row: 4, col: 5 } },
      { color: 'W', position: { row: 6, col: 5 } },
      { color: 'W', position: { row: 5, col: 4 } },
      { color: 'W', position: { row: 5, col: 6 } },
    ])

    expect(stoneAt(states[3].board, 5, 5)).toBe('B')
    expect(states[4].captured).toEqual([{ row: 5, col: 5 }])
    expect(stoneAt(states[4].board, 5, 5)).toBeNull()
  })

  describe('the full real Game 4 sequence', () => {
    const moves: Move[] = GAME4_MOVES.map((m) => ({ color: m.color, position: m.position }))
    const states = computeBoardStates(moves)

    it('produces exactly 180 board states without throwing', () => {
      expect(states).toHaveLength(180)
    })

    it("places move 78, Lee's wedge at ki (White), on the board", () => {
      expect(stoneAt(states[77].board, 8, 10)).toBe('W')
    })

    it('later captures the move-78 stone once it is surrounded (move 91)', () => {
      expect(states[90].captured).toEqual([{ row: 8, col: 10 }])
      expect(stoneAt(states[90].board, 8, 10)).toBeNull()
    })

    it('resolves the known capture events of the real game in order', () => {
      const captureEvents = states
        .map((state) => ({ moveNumber: state.moveNumber, count: state.captured.length }))
        .filter((event) => event.count > 0)

      expect(captureEvents).toEqual([
        { moveNumber: 91, count: 1 },
        { moveNumber: 94, count: 1 },
        { moveNumber: 115, count: 1 },
        { moveNumber: 138, count: 1 },
        { moveNumber: 176, count: 8 },
        { moveNumber: 178, count: 1 },
      ])
    })

    it('leaves the historically correct number of stones on the final board', () => {
      const finalBoard = states[states.length - 1].board
      const stoneCount = finalBoard.reduce(
        (total, row) => total + row.filter((stone) => stone !== null).length,
        0,
      )

      // 180 moves played, 13 stones captured over the course of the game.
      expect(stoneCount).toBe(167)
    })
  })
})
