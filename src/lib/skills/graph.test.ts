import { describe, expect, it } from 'vitest'
import type { HubLink, SkillGroup, SkillNode } from '@/data/skills'
import { deriveSkillEdges, getEdgeVisualState, getNeighborIndices, getNodeVisualState, getSkillReadout } from './graph'

function node(partial: Partial<SkillNode> & Pick<SkillNode, 'id' | 'group' | 'hub'>): SkillNode {
  return { label: partial.id, x: 0, y: 0, note: `${partial.id} note`, ...partial }
}

// Two groups, each with a hub and two members, plus a hub-to-hub link.
const NODES: readonly SkillNode[] = [
  node({ id: 'hub0', group: 0, hub: true, label: 'Hub 0' }), // index 0
  node({ id: 'member0a', group: 0, hub: false }), // index 1
  node({ id: 'member0b', group: 0, hub: false }), // index 2
  node({ id: 'hub1', group: 1, hub: true, label: 'Hub 1' }), // index 3
  node({ id: 'member1a', group: 1, hub: false }), // index 4
]

const HUB_LINKS: readonly HubLink[] = [{ from: 0, to: 1 }]

const GROUPS: readonly SkillGroup[] = [
  { id: 0, name: 'GROUP ZERO' },
  { id: 1, name: 'GROUP ONE' },
]

describe('deriveSkillEdges', () => {
  it('adds a hub-to-member edge for every non-hub node, plus the hub-link edges', () => {
    const edges = deriveSkillEdges(NODES, HUB_LINKS)
    expect(edges).toEqual(
      expect.arrayContaining([
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 3, to: 4 },
        { from: 0, to: 3 },
      ]),
    )
    expect(edges.length).toBe(4)
  })

  it('skips a member whose group has no hub in the node list', () => {
    const orphan = node({ id: 'orphan', group: 99, hub: false })
    const edges = deriveSkillEdges([...NODES, orphan], HUB_LINKS)
    expect(edges.some((edge) => edge.to === NODES.length)).toBe(false)
  })

  it('skips a hub link whose group id has no matching hub', () => {
    const edges = deriveSkillEdges(NODES, [{ from: 0, to: 99 }])
    expect(edges.some((edge) => edge.from === 0 && edge.to === 99)).toBe(false)
  })

  it('returns no edges for an empty node list', () => {
    expect(deriveSkillEdges([], [])).toEqual([])
  })
})

describe('getNeighborIndices', () => {
  const edges = deriveSkillEdges(NODES, HUB_LINKS)

  it('returns an empty set when nothing is active', () => {
    expect(getNeighborIndices(edges, null)).toEqual(new Set())
  })

  it('includes the active node plus every node directly connected to it', () => {
    // Hub 0 connects to member0a, member0b, and hub1 (via the hub link).
    expect(getNeighborIndices(edges, 0)).toEqual(new Set([0, 1, 2, 3]))
  })

  it('includes only the active node and its own hub for a member node', () => {
    expect(getNeighborIndices(edges, 1)).toEqual(new Set([1, 0]))
  })
})

describe('getNodeVisualState', () => {
  const edges = deriveSkillEdges(NODES, HUB_LINKS)
  const neighbors = getNeighborIndices(edges, 0)

  it('marks the active node as active and not dimmed', () => {
    expect(getNodeVisualState(0, 0, neighbors)).toEqual({ isActive: true, isDimmed: false })
  })

  it('does not dim a neighbour of the active node', () => {
    expect(getNodeVisualState(1, 0, neighbors)).toEqual({ isActive: false, isDimmed: false })
  })

  it('dims a node that is neither active nor a neighbour', () => {
    expect(getNodeVisualState(4, 0, neighbors)).toEqual({ isActive: false, isDimmed: true })
  })

  it('dims nothing when there is no active node', () => {
    expect(getNodeVisualState(4, null, new Set())).toEqual({ isActive: false, isDimmed: false })
  })
})

describe('getEdgeVisualState', () => {
  const edges = deriveSkillEdges(NODES, HUB_LINKS)

  it('lights up an edge touching the active node', () => {
    expect(getEdgeVisualState(edges[0], 0)).toEqual({ isActive: true })
  })

  it('leaves an edge untouched by the active node inactive', () => {
    const unrelatedEdge = { from: 3, to: 4 }
    expect(getEdgeVisualState(unrelatedEdge, 0) as { isActive: boolean }).toEqual({ isActive: false })
  })

  it('is inactive for every edge when nothing is active', () => {
    expect(getEdgeVisualState(edges[0], null)).toEqual({ isActive: false })
  })
})

describe('getSkillReadout', () => {
  it('reports the active node label, its group name, and its note', () => {
    const readout = getSkillReadout(NODES, GROUPS, 1)
    expect(readout).toEqual({
      name: NODES[1].label,
      groupLabel: 'GROUP ZERO',
      note: NODES[1].note,
      isActive: true,
    })
  })

  it('falls back to an empty group label if the node references an unknown group', () => {
    const strayNode = node({ id: 'stray', group: 42, hub: false })
    const readout = getSkillReadout([strayNode], GROUPS, 0)
    expect(readout.groupLabel).toBe('')
  })

  it('reports the default idle readout, counting groups and non-hub nodes, when nothing is active', () => {
    const readout = getSkillReadout(NODES, GROUPS, null)
    expect(readout.isActive).toBe(false)
    expect(readout.name).toBe('SKILL GRAPH')
    // 2 groups, 3 non-hub member nodes (member0a, member0b, member1a).
    expect(readout.groupLabel).toBe('2 CLUSTERS · 3 TOOLS')
  })
})
