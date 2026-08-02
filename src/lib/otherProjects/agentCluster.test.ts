import { describe, expect, it } from 'vitest'
import {
  AGENT_CYCLE_LENGTH,
  computeAgentClusterFrame,
  settledAgentClusterFrame,
} from './agentCluster'

describe('computeAgentClusterFrame', () => {
  it('returns exactly one dot model per requested agent, with stable ids 0..n-1', () => {
    const dots = computeAgentClusterFrame(0, 6)

    expect(dots).toHaveLength(6)
    expect(dots.map((dot) => dot.id)).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('returns an empty cluster for zero agents', () => {
    expect(computeAgentClusterFrame(0, 0)).toEqual([])
  })

  it('only ever produces the three documented states', () => {
    for (let tick = 0; tick < AGENT_CYCLE_LENGTH * 2; tick++) {
      const dots = computeAgentClusterFrame(tick, 24)
      for (const dot of dots) {
        expect(['idle', 'active', 'flagged']).toContain(dot.state)
      }
    }
  })

  it('is deterministic: the same tick and agent count always produce the same states', () => {
    const first = computeAgentClusterFrame(11, 24)
    const second = computeAgentClusterFrame(11, 24)
    expect(second).toEqual(first)
  })

  it('offsets each agent from its neighbours, so the cluster is not in lockstep', () => {
    // At tick 0, agents 0 and 1 have different phase offsets (0 vs 5), so
    // they need not share a state across the whole cycle -- spot-check a
    // tick where they documented-ly diverge.
    const dots = computeAgentClusterFrame(10, 24)
    const states = new Set(dots.map((dot) => dot.state))
    expect(states.size).toBeGreaterThan(1)
  })

  it('wraps cleanly across cycle boundaries, matching the frame one cycle later', () => {
    const first = computeAgentClusterFrame(3, 24)
    const wrapped = computeAgentClusterFrame(3 + AGENT_CYCLE_LENGTH, 24)
    expect(wrapped).toEqual(first)
  })

  it('never throws for a negative tick, and still wraps into a valid state', () => {
    const dots = computeAgentClusterFrame(-1, 24)
    expect(dots).toHaveLength(24)
    for (const dot of dots) {
      expect(['idle', 'active', 'flagged']).toContain(dot.state)
    }
  })

  it('only a fraction of agents are ever capable of being flagged', () => {
    // Sweep every phase for a 24-agent cluster; only indices 0, 7, 14, 21
    // (every 7th) are flaggable at all -- the rest must never appear
    // flagged, no matter the tick.
    const everFlagged = new Set<number>()
    for (let tick = 0; tick < AGENT_CYCLE_LENGTH; tick++) {
      for (const dot of computeAgentClusterFrame(tick, 24)) {
        if (dot.state === 'flagged') everFlagged.add(dot.id)
      }
    }
    for (const id of everFlagged) {
      expect(id % 7).toBe(0)
    }
    expect(everFlagged.size).toBeGreaterThan(0)
  })
})

describe('settledAgentClusterFrame', () => {
  it('matches computeAgentClusterFrame at the last frame of the cycle', () => {
    const settled = settledAgentClusterFrame(24)
    const direct = computeAgentClusterFrame(AGENT_CYCLE_LENGTH - 1, 24)
    expect(settled).toEqual(direct)
  })

  it('shows a populated mix, not a blank cluster -- at least one flagged and one idle dot', () => {
    const dots = settledAgentClusterFrame(24)
    const states = dots.map((dot) => dot.state)
    expect(states).toContain('flagged')
    expect(states).toContain('idle')
  })

  it('is deterministic across calls', () => {
    expect(settledAgentClusterFrame(24)).toEqual(settledAgentClusterFrame(24))
  })
})
