import { describe, expect, it } from 'vitest'
import {
  ATTENTION_ROW_COUNT,
  PIPELINE_LOOP_LENGTH,
  candidateSetIndexForCycle,
  computePipelineFrame,
  cycleForTick,
  frameForTick,
  settledPipelineFrame,
  stageAtFrame,
} from './pipeline'

describe('frameForTick', () => {
  it('returns the tick unchanged within the first loop', () => {
    expect(frameForTick(0)).toBe(0)
    expect(frameForTick(40)).toBe(40)
  })

  it('wraps around at the loop length', () => {
    expect(frameForTick(PIPELINE_LOOP_LENGTH)).toBe(0)
    expect(frameForTick(PIPELINE_LOOP_LENGTH + 5)).toBe(5)
    expect(frameForTick(PIPELINE_LOOP_LENGTH * 3 + 7)).toBe(7)
  })

  it('never returns a negative frame, even for a negative tick', () => {
    expect(frameForTick(-1)).toBe(PIPELINE_LOOP_LENGTH - 1)
    expect(frameForTick(-PIPELINE_LOOP_LENGTH)).toBe(0)
  })

  it('respects a custom loop length', () => {
    expect(frameForTick(10, 10)).toBe(0)
    expect(frameForTick(23, 10)).toBe(3)
  })
})

describe('cycleForTick', () => {
  it('is 0 for the entire first loop', () => {
    expect(cycleForTick(0)).toBe(0)
    expect(cycleForTick(PIPELINE_LOOP_LENGTH - 1)).toBe(0)
  })

  it('increments once per full loop', () => {
    expect(cycleForTick(PIPELINE_LOOP_LENGTH)).toBe(1)
    expect(cycleForTick(PIPELINE_LOOP_LENGTH * 2 + 3)).toBe(2)
  })
})

describe('stageAtFrame', () => {
  it('starts at position', () => {
    expect(stageAtFrame(0)).toBe('position')
    expect(stageAtFrame(17)).toBe('position')
  })

  it('moves to tokens, attention, policy, move at their documented boundaries', () => {
    expect(stageAtFrame(18)).toBe('tokens')
    expect(stageAtFrame(27)).toBe('tokens')
    expect(stageAtFrame(28)).toBe('attention')
    expect(stageAtFrame(53)).toBe('attention')
    expect(stageAtFrame(54)).toBe('policy')
    expect(stageAtFrame(63)).toBe('policy')
    expect(stageAtFrame(64)).toBe('move')
    expect(stageAtFrame(PIPELINE_LOOP_LENGTH - 1)).toBe('move')
  })
})

describe('computePipelineFrame', () => {
  const positionLength = 56
  const tokenCount = 9

  it('reveals nothing but the start of the position scan at frame 0', () => {
    const model = computePipelineFrame(0, positionLength, tokenCount)
    expect(model.positionRevealCount).toBe(0)
    expect(model.tokensRevealedCount).toBe(0)
    expect(model.attentionRowsRevealed).toBe(0)
    expect(model.policyRevealed).toBe(false)
    expect(model.moveRevealed).toBe(false)
  })

  it('reveals the full position by the time tokens start', () => {
    const model = computePipelineFrame(18, positionLength, tokenCount)
    expect(model.positionRevealCount).toBe(positionLength)
    expect(model.tokensRevealedCount).toBeGreaterThan(0)
  })

  it('reveals tokens one at a time, capped at the token count', () => {
    const first = computePipelineFrame(18, positionLength, tokenCount)
    expect(first.tokensRevealedCount).toBe(1)

    const mid = computePipelineFrame(20, positionLength, tokenCount)
    expect(mid.tokensRevealedCount).toBe(3)

    const past = computePipelineFrame(70, positionLength, tokenCount)
    expect(past.tokensRevealedCount).toBe(tokenCount)
  })

  it('reveals attention rows progressively, capped at ATTENTION_ROW_COUNT', () => {
    const early = computePipelineFrame(28, positionLength, tokenCount)
    expect(early.attentionRowsRevealed).toBeGreaterThanOrEqual(0)
    expect(early.attentionRowsRevealed).toBeLessThanOrEqual(ATTENTION_ROW_COUNT)

    const late = computePipelineFrame(53, positionLength, tokenCount)
    expect(late.attentionRowsRevealed).toBe(ATTENTION_ROW_COUNT)
  })

  it('completes the attention reveal a few frames before policy starts, so the full grid dwells', () => {
    const almostFull = computePipelineFrame(48, positionLength, tokenCount)
    expect(almostFull.attentionRowsRevealed).toBeLessThan(ATTENTION_ROW_COUNT)

    // Full reveal lands at frame 49 — five frames of dwell before policy
    // starts at frame 54, matching the design reference's pacing.
    for (let frame = 49; frame <= 53; frame++) {
      const model = computePipelineFrame(frame, positionLength, tokenCount)
      expect(model.attentionRowsRevealed).toBe(ATTENTION_ROW_COUNT)
      expect(model.policyRevealed).toBe(false)
    }
  })

  it('reveals policy and move only from their documented frame onward', () => {
    expect(computePipelineFrame(53, positionLength, tokenCount).policyRevealed).toBe(false)
    expect(computePipelineFrame(54, positionLength, tokenCount).policyRevealed).toBe(true)
    expect(computePipelineFrame(63, positionLength, tokenCount).moveRevealed).toBe(false)
    expect(computePipelineFrame(64, positionLength, tokenCount).moveRevealed).toBe(true)
  })

  it('never decreases reveal counts as the frame advances within a loop', () => {
    let prev = computePipelineFrame(0, positionLength, tokenCount)
    for (let tick = 1; tick < PIPELINE_LOOP_LENGTH; tick++) {
      const next = computePipelineFrame(tick, positionLength, tokenCount)
      expect(next.positionRevealCount).toBeGreaterThanOrEqual(prev.positionRevealCount)
      expect(next.tokensRevealedCount).toBeGreaterThanOrEqual(prev.tokensRevealedCount)
      expect(next.attentionRowsRevealed).toBeGreaterThanOrEqual(prev.attentionRowsRevealed)
      prev = next
    }
  })

  it('reports the cycle it falls in, alongside the wrapped frame', () => {
    const model = computePipelineFrame(PIPELINE_LOOP_LENGTH + 10, positionLength, tokenCount)
    expect(model.frame).toBe(10)
    expect(model.cycle).toBe(1)
  })
})

describe('candidateSetIndexForCycle', () => {
  it('rotates through the available sets in order', () => {
    expect(candidateSetIndexForCycle(0, 3)).toBe(0)
    expect(candidateSetIndexForCycle(1, 3)).toBe(1)
    expect(candidateSetIndexForCycle(2, 3)).toBe(2)
    expect(candidateSetIndexForCycle(3, 3)).toBe(0)
  })

  it('is always 0 when there is only one set', () => {
    expect(candidateSetIndexForCycle(0, 1)).toBe(0)
    expect(candidateSetIndexForCycle(5, 1)).toBe(0)
  })

  it('does not throw or return a negative index for a zero set count', () => {
    expect(candidateSetIndexForCycle(3, 0)).toBe(0)
  })
})

describe('settledPipelineFrame', () => {
  it('is fully resolved: every stage revealed, nothing left to animate', () => {
    const model = settledPipelineFrame(56, 9)
    expect(model.stage).toBe('move')
    expect(model.positionRevealCount).toBe(56)
    expect(model.tokensRevealedCount).toBe(9)
    expect(model.attentionRowsRevealed).toBe(ATTENTION_ROW_COUNT)
    expect(model.policyRevealed).toBe(true)
    expect(model.moveRevealed).toBe(true)
  })

  it('matches computePipelineFrame at the last frame of the loop', () => {
    const settled = settledPipelineFrame(56, 9)
    const direct = computePipelineFrame(PIPELINE_LOOP_LENGTH - 1, 56, 9)
    expect(settled).toEqual(direct)
  })
})
