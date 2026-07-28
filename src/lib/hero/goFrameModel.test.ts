import { describe, expect, it } from 'vitest'
import { GAME4_MOVES } from '@/data/game4Moves'
import { TOTAL_MOVES } from './goTiming'
import { GAME4_BOARD_STATES, MOVE_78_POSITION, frameForMove, staticFinalFrame } from './goFrameModel'

describe('MOVE_78_POSITION', () => {
  it('matches the real move 78 coordinate (W ki, row 8 col 10)', () => {
    expect(MOVE_78_POSITION).toEqual({ row: 8, col: 10 })
  })
})

describe('frameForMove', () => {
  it('is empty at move 0', () => {
    expect(frameForMove(0).stones).toHaveLength(0)
    expect(frameForMove(0).move78Marker).toBeNull()
  })

  it('has exactly one stone on the board after move 1', () => {
    const frame = frameForMove(1)
    expect(frame.stones).toHaveLength(1)
    expect(frame.stones[0]).toMatchObject({ row: 3, col: 15, color: 'B' })
  })

  it('has no move78Marker before move 78', () => {
    expect(frameForMove(77).move78Marker).toBeNull()
  })

  it('marks move78Marker at the move-78 coordinate from move 78 onward', () => {
    expect(frameForMove(78).move78Marker).toEqual(MOVE_78_POSITION)
    expect(frameForMove(180).move78Marker).toEqual(MOVE_78_POSITION)
  })

  it('renders the move-78 stone with the move78 variant while it is on the board', () => {
    const frame = frameForMove(78)
    const stone = frame.stones.find((s) => s.row === MOVE_78_POSITION.row && s.col === MOVE_78_POSITION.col)
    expect(stone?.variant).toBe('move78')
  })

  it('the number of stones on the board never exceeds the move number (captures only remove)', () => {
    for (let n = 1; n <= TOTAL_MOVES; n++) {
      expect(frameForMove(n).stones.filter((s) => s.variant !== 'leaving').length).toBeLessThanOrEqual(n)
    }
  })

  it('the board reflects real captures: a move exists where the stone count drops', () => {
    const counts = Array.from({ length: TOTAL_MOVES }, (_, i) =>
      frameForMove(i + 1).stones.filter((s) => s.variant !== 'leaving').length,
    )
    const hasCaptureDrop = counts.some((count, i) => i > 0 && count < counts[i - 1])
    expect(hasCaptureDrop).toBe(true)
  })

  it('the move-78 stone is itself captured later in the game (move 91) -- real, not a bug', () => {
    const move90 = frameForMove(90).stones.find(
      (s) => s.row === MOVE_78_POSITION.row && s.col === MOVE_78_POSITION.col,
    )
    const move91 = frameForMove(91).stones.find(
      (s) => s.row === MOVE_78_POSITION.row && s.col === MOVE_78_POSITION.col && s.variant !== 'leaving',
    )
    expect(move90).toBeDefined()
    expect(move91).toBeUndefined()
  })

  it('marks stones captured at a given move as "leaving" within the capture-fade window', () => {
    // Find a move that captures at least one stone.
    const captureMove = GAME4_BOARD_STATES.findIndex((state) => state.captured.length > 0) + 1
    expect(captureMove).toBeGreaterThan(0)

    const midFade = frameForMove(captureMove, 100)
    const leaving = midFade.stones.filter((s) => s.variant === 'leaving')
    expect(leaving.length).toBeGreaterThan(0)
  })

  it('does not report "leaving" stones once the capture-fade window has passed', () => {
    const captureMove = GAME4_BOARD_STATES.findIndex((state) => state.captured.length > 0) + 1
    const afterFade = frameForMove(captureMove, 10_000)
    expect(afterFade.stones.some((s) => s.variant === 'leaving')).toBe(false)
  })

  it('clamps to the final position for move numbers beyond 180', () => {
    expect(frameForMove(500)).toEqual(frameForMove(TOTAL_MOVES))
  })
})

describe('staticFinalFrame', () => {
  it('shows the final position with move 78 marked and nothing mid-animation', () => {
    const frame = staticFinalFrame()
    expect(frame.moveNumber).toBe(TOTAL_MOVES)
    expect(frame.move78Marker).toEqual(MOVE_78_POSITION)
    expect(frame.stones.some((s) => s.variant === 'leaving')).toBe(false)
  })

  it('matches the real board state after all 180 moves', () => {
    const frame = staticFinalFrame()
    const finalBoard = GAME4_BOARD_STATES[TOTAL_MOVES - 1].board
    let expectedCount = 0
    for (const row of finalBoard) for (const cell of row) if (cell !== null) expectedCount++
    expect(frame.stones).toHaveLength(expectedCount)
  })
})

describe('GAME4_MOVES sanity (already covered by data/game4Moves.test.ts, spot-checked here too)', () => {
  it('has exactly 180 moves', () => {
    expect(GAME4_MOVES).toHaveLength(180)
  })
})
