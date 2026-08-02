import { describe, expect, it } from 'vitest'
import {
  CAPTURE_FADE_MS,
  FADE_MS,
  HOLD_MS,
  LOOP_MS,
  MOVE_78,
  SEQUENCE_MS,
  TOTAL_MOVES,
  frameAtElapsed,
  moveDelayMs,
  moveTimestampMs,
} from './goTiming'

describe('moveTimestampMs', () => {
  it('is strictly increasing across all 180 moves', () => {
    for (let n = 2; n <= TOTAL_MOVES; n++) {
      expect(moveTimestampMs(n)).toBeGreaterThan(moveTimestampMs(n - 1))
    }
  })

  it('places move 1 after a short initial delay, not instantly', () => {
    expect(moveTimestampMs(1)).toBeGreaterThan(0)
  })
})

describe('moveDelayMs', () => {
  it('is slow in the opening (first 10 moves)', () => {
    for (let n = 2; n <= 10; n++) {
      expect(moveDelayMs(n)).toBeGreaterThanOrEqual(390 * 1.5)
    }
  })

  it('generally trends faster from the opening into the middlegame', () => {
    expect(moveDelayMs(15)).toBeLessThan(moveDelayMs(2))
    expect(moveDelayMs(50)).toBeLessThan(moveDelayMs(15))
  })

  it('is fast immediately before move 78', () => {
    expect(moveDelayMs(MOVE_78 - 1)).toBeLessThan(150 * 1.5)
  })

  it('gives move 78 the single longest delay of the whole game -- the deliberate pause', () => {
    const delays = Array.from({ length: TOTAL_MOVES }, (_, i) => moveDelayMs(i + 1))
    const max = Math.max(...delays)
    expect(moveDelayMs(MOVE_78)).toBe(max)
    // The pause is dramatically longer than its neighbours, not just the max by a hair.
    expect(moveDelayMs(MOVE_78)).toBeGreaterThan(moveDelayMs(MOVE_78 - 1) * 5)
    expect(moveDelayMs(MOVE_78)).toBeGreaterThan(moveDelayMs(MOVE_78 + 1) * 5)
  })

  it('is fast again through the endgame after move 78', () => {
    expect(moveDelayMs(160)).toBeLessThan(moveDelayMs(MOVE_78 + 2))
  })

  it('reaches its fastest pace by the final moves', () => {
    expect(moveDelayMs(TOTAL_MOVES)).toBeLessThanOrEqual(moveDelayMs(100))
  })
})

describe('LOOP_MS', () => {
  it('lands close to ~43s -- 1.5x the spec\'s original ~30s target, after slowing the pace', () => {
    expect(LOOP_MS).toBeGreaterThan(40_000)
    expect(LOOP_MS).toBeLessThan(46_000)
  })

  it('is the sequence plus the hold plus the fade', () => {
    expect(LOOP_MS).toBe(SEQUENCE_MS + HOLD_MS + FADE_MS)
  })
})

describe('frameAtElapsed', () => {
  it('shows no moves at t=0', () => {
    expect(frameAtElapsed(0).moveNumber).toBe(0)
  })

  it('reports "playing" and advances the move number as time passes', () => {
    const early = frameAtElapsed(moveTimestampMs(5))
    const later = frameAtElapsed(moveTimestampMs(50))
    expect(early.phase).toBe('playing')
    expect(later.moveNumber).toBeGreaterThan(early.moveNumber)
  })

  it('shows exactly move 78 right as its timestamp is crossed', () => {
    const frame = frameAtElapsed(moveTimestampMs(78))
    expect(frame.moveNumber).toBe(78)
    // Sub-picosecond float noise from the 1.5x pace multiplier's
    // fractional-ms cumulative sums; not a real elapsed time.
    expect(frame.elapsedSinceMove).toBeCloseTo(0, 5)
  })

  it('holds at the final move once the sequence completes', () => {
    const frame = frameAtElapsed(SEQUENCE_MS + HOLD_MS / 2)
    expect(frame.moveNumber).toBe(TOTAL_MOVES)
    expect(frame.phase).toBe('holding')
  })

  it('fades after the hold, before the loop restarts', () => {
    const frame = frameAtElapsed(SEQUENCE_MS + HOLD_MS + FADE_MS / 2)
    expect(frame.moveNumber).toBe(TOTAL_MOVES)
    expect(frame.phase).toBe('fading')
  })

  it('loops back to the start after LOOP_MS', () => {
    const first = frameAtElapsed(moveTimestampMs(30))
    const looped = frameAtElapsed(moveTimestampMs(30) + LOOP_MS)
    expect(looped.moveNumber).toBe(first.moveNumber)
    expect(looped.phase).toBe(first.phase)
  })

  it('reports elapsedSinceMove counting up from zero right after any move appears', () => {
    const justAfter = frameAtElapsed(moveTimestampMs(50) + 10)
    expect(justAfter.moveNumber).toBe(50)
    expect(justAfter.elapsedSinceMove).toBeCloseTo(10, 5)
    expect(justAfter.elapsedSinceMove).toBeLessThan(CAPTURE_FADE_MS)
  })
})
