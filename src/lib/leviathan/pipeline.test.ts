import { describe, expect, it } from 'vitest'
import {
  ATTENTION_ROW_COUNT,
  PIPELINE_LOOP_LENGTH,
  buildAttentionCellModels,
  buildFenCharModels,
  buildTokenModels,
  candidateSetIndexForCycle,
  computePipelineFrame,
  cycleForTick,
  frameForTick,
  settledPipelineFrame,
  stageAtFrame,
} from './pipeline'

describe('frameForTick', () => {
  it('wraps ticks into [0, loopLength)', () => {
    expect(frameForTick(0)).toBe(0)
    expect(frameForTick(PIPELINE_LOOP_LENGTH)).toBe(0)
    expect(frameForTick(PIPELINE_LOOP_LENGTH + 5)).toBe(5)
  })

  it('wraps negative ticks into a positive frame', () => {
    expect(frameForTick(-1)).toBe(PIPELINE_LOOP_LENGTH - 1)
  })

  it('respects a custom loop length', () => {
    expect(frameForTick(10, 4)).toBe(2)
  })
})

describe('cycleForTick', () => {
  it('increments once per full loop', () => {
    expect(cycleForTick(0)).toBe(0)
    expect(cycleForTick(PIPELINE_LOOP_LENGTH - 1)).toBe(0)
    expect(cycleForTick(PIPELINE_LOOP_LENGTH)).toBe(1)
    expect(cycleForTick(PIPELINE_LOOP_LENGTH * 2 + 3)).toBe(2)
  })
})

describe('stageAtFrame', () => {
  it('reports the active stage at each stage boundary', () => {
    expect(stageAtFrame(0)).toBe('position')
    expect(stageAtFrame(17)).toBe('position')
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
  it('reveals nothing at frame 0', () => {
    const model = computePipelineFrame(0, 40, 6)
    expect(model.frame).toBe(0)
    expect(model.cycle).toBe(0)
    expect(model.stage).toBe('position')
    expect(model.positionRevealCount).toBe(0)
    expect(model.tokensRevealedCount).toBe(0)
    expect(model.attentionRowsRevealed).toBe(0)
    expect(model.policyRevealed).toBe(false)
    expect(model.moveRevealed).toBe(false)
  })

  it('reveals tokens one at a time once the tokens stage starts', () => {
    const model = computePipelineFrame(20, 40, 6)
    expect(model.stage).toBe('tokens')
    expect(model.tokensRevealedCount).toBe(3) // 20 - 18 + 1
  })

  it('caps tokensRevealedCount at tokenCount', () => {
    const model = computePipelineFrame(30, 40, 2)
    expect(model.tokensRevealedCount).toBe(2)
  })

  it('reveals the fully-scanned position string by the end of the position stage', () => {
    const model = computePipelineFrame(18, 40, 6)
    expect(model.positionRevealCount).toBe(40)
  })

  it('sets policyRevealed and moveRevealed at their stage boundaries', () => {
    expect(computePipelineFrame(53, 10, 4).policyRevealed).toBe(false)
    expect(computePipelineFrame(54, 10, 4).policyRevealed).toBe(true)
    expect(computePipelineFrame(63, 10, 4).moveRevealed).toBe(false)
    expect(computePipelineFrame(64, 10, 4).moveRevealed).toBe(true)
  })

  it('tracks the cycle count across loop boundaries', () => {
    const model = computePipelineFrame(PIPELINE_LOOP_LENGTH + 10, 40, 6)
    expect(model.cycle).toBe(1)
    expect(model.frame).toBe(10)
  })
})

describe('settledPipelineFrame', () => {
  it('fully reveals every stage using the last frame of the loop', () => {
    const model = settledPipelineFrame(40, 6)
    expect(model.frame).toBe(PIPELINE_LOOP_LENGTH - 1)
    expect(model.stage).toBe('move')
    expect(model.positionRevealCount).toBe(40)
    expect(model.tokensRevealedCount).toBe(6)
    expect(model.attentionRowsRevealed).toBe(ATTENTION_ROW_COUNT)
    expect(model.policyRevealed).toBe(true)
    expect(model.moveRevealed).toBe(true)
  })
})

describe('candidateSetIndexForCycle', () => {
  it('rotates deterministically through the available sets', () => {
    expect(candidateSetIndexForCycle(0, 3)).toBe(0)
    expect(candidateSetIndexForCycle(1, 3)).toBe(1)
    expect(candidateSetIndexForCycle(3, 3)).toBe(0)
    expect(candidateSetIndexForCycle(4, 3)).toBe(1)
  })

  it('wraps negative cycles into range', () => {
    expect(candidateSetIndexForCycle(-1, 3)).toBe(2)
  })

  it('returns 0 when there are no candidate sets', () => {
    expect(candidateSetIndexForCycle(5, 0)).toBe(0)
  })
})

describe('buildFenCharModels', () => {
  it('marks characters before the reveal count as revealed, with a cursor at the last one', () => {
    const models = buildFenCharModels('abc', 2)
    expect(models).toEqual([
      { ch: 'a', revealed: true, isCursor: false },
      { ch: 'b', revealed: true, isCursor: true },
      { ch: 'c', revealed: false, isCursor: false },
    ])
  })

  it('has no cursor when nothing has been revealed', () => {
    const models = buildFenCharModels('abc', 0)
    expect(models.every((m) => !m.isCursor && !m.revealed)).toBe(true)
  })
})

describe('buildTokenModels', () => {
  it('reveals only the leading tokens up to revealedCount', () => {
    const models = buildTokenModels(['a', 'b', 'c'], 1)
    expect(models).toEqual([
      { id: 'a', revealed: true },
      { id: 'b', revealed: false },
      { id: 'c', revealed: false },
    ])
  })
})

describe('buildAttentionCellModels', () => {
  it('masks cells above the causal diagonal and rows not yet revealed', () => {
    const cells = buildAttentionCellModels(2, 3)
    const masked = new Map(cells.map((cell) => [`${cell.row},${cell.col}`, cell.masked]))
    // row 0: only col 0 is unmasked (col <= row)
    expect(masked.get('0,0')).toBe(false)
    expect(masked.get('0,1')).toBe(true)
    expect(masked.get('0,2')).toBe(true)
    // row 1: col 0 and 1 unmasked (col <= row), both within revealed rows
    expect(masked.get('1,0')).toBe(false)
    expect(masked.get('1,1')).toBe(false)
    expect(masked.get('1,2')).toBe(true)
    // row 2 is not yet revealed (attentionRowsRevealed = 2), so fully masked
    expect(masked.get('2,0')).toBe(true)
    expect(masked.get('2,1')).toBe(true)
    expect(masked.get('2,2')).toBe(true)
  })

  it('gives masked cells the flat masked intensity', () => {
    const cells = buildAttentionCellModels(0, 3)
    expect(cells.every((cell) => cell.masked && cell.intensity === 0.05)).toBe(true)
  })

  it('computes a graduated intensity for unmasked cells', () => {
    const cells = buildAttentionCellModels(3, 3)
    const cell00 = cells.find((c) => c.row === 0 && c.col === 0)
    const cell10 = cells.find((c) => c.row === 1 && c.col === 0)
    expect(cell00?.intensity).toBeCloseTo(0.631, 3)
    expect(cell10?.intensity).toBeCloseTo(0.3308, 3)
  })
})
