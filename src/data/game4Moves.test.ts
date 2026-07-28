import { describe, expect, it } from 'vitest'
import { BOARD_SIZE } from '@/lib/go/board'
import { GAME4_MOVES } from './game4Moves'

describe('GAME4_MOVES', () => {
  it('holds exactly 180 moves', () => {
    expect(GAME4_MOVES).toHaveLength(180)
  })

  it('alternates colours strictly, starting with Black', () => {
    expect(GAME4_MOVES[0].color).toBe('B')

    for (let i = 1; i < GAME4_MOVES.length; i++) {
      expect(GAME4_MOVES[i].color).not.toBe(GAME4_MOVES[i - 1].color)
    }
  })

  it('keeps every coordinate on the 19x19 board', () => {
    for (const move of GAME4_MOVES) {
      expect(move.position.row).toBeGreaterThanOrEqual(0)
      expect(move.position.row).toBeLessThan(BOARD_SIZE)
      expect(move.position.col).toBeGreaterThanOrEqual(0)
      expect(move.position.col).toBeLessThan(BOARD_SIZE)
    }
  })

  it('numbers moves sequentially from 1', () => {
    GAME4_MOVES.forEach((move, index) => {
      expect(move.moveNumber).toBe(index + 1)
    })
  })

  it('opens with Black at pd, confirming AlphaGo played Black', () => {
    const move1 = GAME4_MOVES[0]
    expect(move1.color).toBe('B')
    expect(move1.sgf).toBe('pd')
    // 'p' - 'a' = 15, 'd' - 'a' = 3
    expect(move1.position).toEqual({ row: 3, col: 15 })
  })

  it("has Lee's wedge, White at ki, as move 78", () => {
    const move78 = GAME4_MOVES[77]
    expect(move78.color).toBe('W')
    expect(move78.sgf).toBe('ki')
    // 'k' - 'a' = 10, 'i' - 'a' = 8
    expect(move78.position).toEqual({ row: 8, col: 10 })
  })
})
