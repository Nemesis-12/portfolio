import { describe, expect, it } from 'vitest'
import { AGENT_CYCLE_LENGTH, computeAgentClusterFrame, settledAgentClusterFrame } from './agentCluster'

describe('computeAgentClusterFrame', () => {
  it('returns one dot per agent, with sequential ids', () => {
    const dots = computeAgentClusterFrame(0, 5)
    expect(dots.map((dot) => dot.id)).toEqual([0, 1, 2, 3, 4])
  })

  it('returns an empty list for zero agents', () => {
    expect(computeAgentClusterFrame(0, 0)).toEqual([])
  })

  it('starts a flaggable agent (index 0) idle, then active, then flagged over its cycle', () => {
    // index 0 has phase offset 0 and is flaggable (0 % 7 === 0).
    expect(computeAgentClusterFrame(0, 1)[0].state).toBe('idle')
    expect(computeAgentClusterFrame(14, 1)[0].state).toBe('idle')
    expect(computeAgentClusterFrame(15, 1)[0].state).toBe('active')
    expect(computeAgentClusterFrame(20, 1)[0].state).toBe('active')
    expect(computeAgentClusterFrame(21, 1)[0].state).toBe('flagged')
    expect(computeAgentClusterFrame(23, 1)[0].state).toBe('flagged')
  })

  it('wraps a flaggable agent back to idle after one full cycle', () => {
    expect(computeAgentClusterFrame(AGENT_CYCLE_LENGTH, 1)[0].state).toBe('idle')
  })

  it('never flags a non-flaggable agent, capping it at active', () => {
    // index 1 is not flaggable (1 % 7 !== 0); its phase is offset by 5.
    const dots = computeAgentClusterFrame(0, 2)
    // phase for index 1 at tick 0 is (0 + 5) % 24 = 5 -> idle
    expect(dots[1].state).toBe('idle')

    // Push tick so index 1's phase lands in the flagged range (>= 21);
    // it must still read 'active', never 'flagged'.
    const flaggedRangeDots = computeAgentClusterFrame(16, 2) // phase = (16+5)%24 = 21
    expect(flaggedRangeDots[1].state).toBe('active')
  })

  it('offsets each agent from its neighbours so the cluster is not in lockstep', () => {
    const dots = computeAgentClusterFrame(15, 3)
    // index 0: phase 15 -> active. index 1: phase (15+5)%24=20 -> active.
    // index 2: phase (15+10)%24=1 -> idle.
    expect(dots.map((d) => d.state)).toEqual(['active', 'active', 'idle'])
  })
})

describe('settledAgentClusterFrame', () => {
  it('matches the frame at the last tick of one cycle', () => {
    expect(settledAgentClusterFrame(10)).toEqual(computeAgentClusterFrame(AGENT_CYCLE_LENGTH - 1, 10))
  })

  it('shows a mix of states rather than a single frozen state', () => {
    const dots = settledAgentClusterFrame(10)
    const states = new Set(dots.map((dot) => dot.state))
    expect(states.size).toBeGreaterThan(1)
  })
})
