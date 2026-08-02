import { describe, expect, it } from 'vitest'
import { GAME4_MOVES } from '@/data/game4Moves'
import { CAPTURE_FADE_MS, TOTAL_MOVES, moveTimestampMs } from './goTiming'
import {
  GAME4_BOARD_STATES,
  MOVE_78_POSITION,
  frameForMove,
  hasActiveCaptureFade,
  staticFinalFrame,
} from './goFrameModel'

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

  it('marks stones captured at a given move as "leaving" while that move is still current', () => {
    // Find a move that captures at least one stone.
    const captureMove = GAME4_BOARD_STATES.findIndex((state) => state.captured.length > 0) + 1
    expect(captureMove).toBeGreaterThan(0)

    const midFade = frameForMove(captureMove, moveTimestampMs(captureMove) + 100)
    const leaving = midFade.stones.filter((s) => s.variant === 'leaving')
    expect(leaving.length).toBeGreaterThan(0)
  })

  it('does not report "leaving" stones once the capture-fade window has passed', () => {
    const captureMove = GAME4_BOARD_STATES.findIndex((state) => state.captured.length > 0) + 1
    const afterFade = frameForMove(captureMove, moveTimestampMs(captureMove) + 10_000)
    expect(afterFade.stones.some((s) => s.variant === 'leaving')).toBe(false)
  })

  it('clamps to the final position for move numbers beyond 180', () => {
    expect(frameForMove(500)).toEqual(frameForMove(TOTAL_MOVES))
  })

  describe('capture fades survive the next move arriving (the exit-animation-truncation bug)', () => {
    // Real Game 4 data: move 176 captures an 8-stone group, and the very
    // next move (177) appears just 50ms later -- far inside the 550ms
    // CAPTURE_FADE_MS window. A correct model must keep reporting those 8
    // stones as "leaving" at move 177's own frame, not drop them the
    // instant move 177 becomes current. Move 178 captures again 50ms after
    // that, so its fade window overlaps move 176's.
    const MOVE_176 = 176
    const MOVE_178 = 178

    it('move 176 really captures 8 stones and move 178 really captures 1 (sanity, matches the issue data)', () => {
      expect(GAME4_BOARD_STATES[MOVE_176 - 1].captured).toHaveLength(8)
      expect(GAME4_BOARD_STATES[MOVE_178 - 1].captured).toHaveLength(1)
    })

    it('all 8 of move 176\'s captured stones are still "leaving" once move 177 is current', () => {
      const captured = GAME4_BOARD_STATES[MOVE_176 - 1].captured
      const frame = frameForMove(MOVE_176 + 1, moveTimestampMs(MOVE_176 + 1))

      for (const position of captured) {
        const stone = frame.stones.find(
          (s) => s.row === position.row && s.col === position.col && s.variant === 'leaving',
        )
        expect(stone).toBeDefined()
      }
      expect(frame.moveNumber).toBe(MOVE_176 + 1)
    })

    it('move 176\'s fade is still present at move 178, and move 178\'s own capture is fading too (overlapping fades)', () => {
      const move176Captured = GAME4_BOARD_STATES[MOVE_176 - 1].captured
      const move178Captured = GAME4_BOARD_STATES[MOVE_178 - 1].captured
      const frame = frameForMove(MOVE_178, moveTimestampMs(MOVE_178))

      for (const position of move176Captured) {
        expect(
          frame.stones.some(
            (s) => s.row === position.row && s.col === position.col && s.variant === 'leaving',
          ),
        ).toBe(true)
      }
      for (const position of move178Captured) {
        expect(
          frame.stones.some(
            (s) => s.row === position.row && s.col === position.col && s.variant === 'leaving',
          ),
        ).toBe(true)
      }
    })

    it('the leaving stone keeps the same React key across the moves it survives', () => {
      const [firstCaptured] = GAME4_BOARD_STATES[MOVE_176 - 1].captured
      const keyAt177 = frameForMove(MOVE_176 + 1, moveTimestampMs(MOVE_176 + 1)).stones.find(
        (s) => s.row === firstCaptured.row && s.col === firstCaptured.col && s.variant === 'leaving',
      )?.key
      const keyAt178 = frameForMove(MOVE_178, moveTimestampMs(MOVE_178)).stones.find(
        (s) => s.row === firstCaptured.row && s.col === firstCaptured.col && s.variant === 'leaving',
      )?.key

      expect(keyAt177).toBeDefined()
      expect(keyAt178).toBeDefined()
      expect(keyAt177).toBe(keyAt178)
    })

    it("move 176's fade has fully expired well past its own CAPTURE_FADE_MS deadline", () => {
      // Checked by key, not position: one of move 176's 8 points is played
      // back into and re-captured at move 178 (a real snapback in the
      // game), so by this time the *position* can legitimately host a
      // fresh, still-fading move-178 "leaving" stone even though move
      // 176's own fade for that key is long gone.
      const captured = GAME4_BOARD_STATES[MOVE_176 - 1].captured
      const longAfter = moveTimestampMs(MOVE_176) + CAPTURE_FADE_MS + 1
      const frame = frameForMove(TOTAL_MOVES, longAfter)

      for (const position of captured) {
        const expiredKey = `leaving-${position.row}-${position.col}-${MOVE_176}`
        expect(frame.stones.some((s) => s.key === expiredKey)).toBe(false)
      }
    })

    it('a fade in flight at the end of one loop does not bleed into a fresh loop after wraparound', () => {
      // If the sequence has just restarted (loopElapsed near zero) but a
      // stale frame still asks about a late move number, the move-176
      // capture -- which happened tens of seconds into the *previous*
      // loop -- must not be reported as still fading.
      const frame = frameForMove(MOVE_178, 10)
      const captured = GAME4_BOARD_STATES[MOVE_176 - 1].captured
      for (const position of captured) {
        expect(
          frame.stones.some(
            (s) => s.row === position.row && s.col === position.col && s.variant === 'leaving',
          ),
        ).toBe(false)
      }
    })
  })

  describe('hasActiveCaptureFade', () => {
    it('is true immediately after move 176\'s capture and false long after it', () => {
      expect(hasActiveCaptureFade(moveTimestampMs(176) + 10)).toBe(true)
      expect(hasActiveCaptureFade(moveTimestampMs(176) + CAPTURE_FADE_MS + 1)).toBe(true) // move 178 overlaps
      expect(hasActiveCaptureFade(moveTimestampMs(178) + CAPTURE_FADE_MS + 1)).toBe(false)
    })

    it('is false before any capture has happened', () => {
      expect(hasActiveCaptureFade(0)).toBe(false)
    })
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
