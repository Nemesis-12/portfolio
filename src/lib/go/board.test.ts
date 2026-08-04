import { describe, expect, it } from 'vitest'
import { applyMove, computeBoardStates, createEmptyBoard, type Move } from './board'

describe('createEmptyBoard', () => {
  it('produces a 19x19 board of nulls', () => {
    const board = createEmptyBoard()
    expect(board.length).toBe(19)
    expect(board.every((row) => row.length === 19 && row.every((stone) => stone === null))).toBe(true)
  })
})

describe('applyMove', () => {
  it('places a stone at the given position with no captures', () => {
    const board = createEmptyBoard()
    const result = applyMove(board, { color: 'B', position: { row: 3, col: 3 } })
    expect(result.board[3][3]).toBe('B')
    expect(result.captured).toEqual([])
  })

  it('does not mutate the board passed in', () => {
    const board = createEmptyBoard()
    applyMove(board, { color: 'B', position: { row: 3, col: 3 } })
    expect(board[3][3]).toBe(null)
  })

  it('throws on an out-of-bounds move', () => {
    const board = createEmptyBoard()
    expect(() => applyMove(board, { color: 'B', position: { row: -1, col: 0 } })).toThrow()
    expect(() => applyMove(board, { color: 'B', position: { row: 0, col: 19 } })).toThrow()
  })

  it('throws when the target position is already occupied', () => {
    const board = createEmptyBoard()
    const afterFirst = applyMove(board, { color: 'B', position: { row: 5, col: 5 } }).board
    expect(() => applyMove(afterFirst, { color: 'W', position: { row: 5, col: 5 } })).toThrow()
  })

  it('captures a single stone surrounded in a corner', () => {
    const moves: Move[] = [
      { color: 'W', position: { row: 0, col: 0 } },
      { color: 'B', position: { row: 0, col: 1 } },
      { color: 'B', position: { row: 1, col: 0 } },
    ]
    const states = computeBoardStates(moves)
    const last = states[states.length - 1]
    expect(last.captured).toEqual([{ row: 0, col: 0 }])
    expect(last.board[0][0]).toBe(null)
    expect(last.board[0][1]).toBe('B')
    expect(last.board[1][0]).toBe('B')
  })

  it('captures a multi-stone group when its last liberty is filled', () => {
    // Two connected white stones fully surrounded by black.
    const moves: Move[] = [
      { color: 'W', position: { row: 5, col: 5 } },
      { color: 'W', position: { row: 5, col: 6 } },
      { color: 'B', position: { row: 4, col: 5 } },
      { color: 'B', position: { row: 4, col: 6 } },
      { color: 'B', position: { row: 6, col: 5 } },
      { color: 'B', position: { row: 6, col: 6 } },
      { color: 'B', position: { row: 5, col: 4 } },
      { color: 'B', position: { row: 5, col: 7 } },
    ]
    const states = computeBoardStates(moves)
    const last = states[states.length - 1]
    expect(last.captured).toEqual(
      expect.arrayContaining([
        { row: 5, col: 5 },
        { row: 5, col: 6 },
      ]),
    )
    expect(last.captured.length).toBe(2)
    expect(last.board[5][5]).toBe(null)
    expect(last.board[5][6]).toBe(null)
  })

  it('removes a self-capturing (suicide) stone with no liberties', () => {
    const moves: Move[] = [
      { color: 'B', position: { row: 0, col: 1 } },
      { color: 'B', position: { row: 1, col: 0 } },
      { color: 'W', position: { row: 0, col: 0 } },
    ]
    const states = computeBoardStates(moves)
    const last = states[states.length - 1]
    expect(last.captured).toEqual([{ row: 0, col: 0 }])
    expect(last.board[0][0]).toBe(null)
    expect(last.board[0][1]).toBe('B')
    expect(last.board[1][0]).toBe('B')
  })

  it('is not a self-capture when the move simultaneously captures an opponent group that frees a liberty', () => {
    // White plays at P=(5,5), whose only apparent liberty is a lone black
    // stone at E=(5,6) that itself has zero liberties once P is filled.
    // Captures must resolve before the mover's own liberties are checked,
    // so this is a legal capturing move, not suicide.
    const moves: Move[] = [
      { color: 'B', position: { row: 4, col: 5 } }, // N
      { color: 'B', position: { row: 6, col: 5 } }, // S
      { color: 'B', position: { row: 5, col: 4 } }, // W
      { color: 'W', position: { row: 4, col: 6 } },
      { color: 'W', position: { row: 6, col: 6 } },
      { color: 'W', position: { row: 5, col: 7 } },
      { color: 'B', position: { row: 5, col: 6 } }, // E, lone stone pinned by the three whites above
      { color: 'W', position: { row: 5, col: 5 } }, // P
    ]
    const states = computeBoardStates(moves)
    const last = states[states.length - 1]
    expect(last.captured).toEqual([{ row: 5, col: 6 }])
    expect(last.board[5][5]).toBe('W')
    expect(last.board[5][6]).toBe(null)
  })
})

describe('computeBoardStates', () => {
  it('produces one entry per move, numbered from 1', () => {
    const moves: Move[] = [
      { color: 'B', position: { row: 0, col: 0 } },
      { color: 'W', position: { row: 1, col: 1 } },
      { color: 'B', position: { row: 2, col: 2 } },
    ]
    const states = computeBoardStates(moves)
    expect(states.map((state) => state.moveNumber)).toEqual([1, 2, 3])
    expect(states.map((state) => state.move)).toEqual(moves)
  })

  it('carries stones forward across moves without duplicating captures', () => {
    const moves: Move[] = [
      { color: 'B', position: { row: 0, col: 0 } },
      { color: 'W', position: { row: 5, col: 5 } },
    ]
    const states = computeBoardStates(moves)
    expect(states[0].board[0][0]).toBe('B')
    expect(states[1].board[0][0]).toBe('B')
    expect(states[1].board[5][5]).toBe('W')
  })
})
