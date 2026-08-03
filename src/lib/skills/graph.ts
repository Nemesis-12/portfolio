/**
 * Pure model logic for the skills graph (issue #319): given the graph
 * content (`src/data/skills.ts`) and which node, if any, is the visitor's
 * current "active" node (hovered, focused, or tapped), derive the edge
 * list, which nodes count as that node's neighbours, and the visual state
 * of every node/edge/readout.
 *
 * No React and no DOM here — same split `src/lib/otherProjects/
 * agentCluster.ts` uses for the thesis's agent-dot cluster: the component
 * (`src/components/sections/skills/SkillsGraph.tsx`) owns state and event
 * handlers and calls into this file to figure out what to render, which
 * keeps this logic unit-testable without mounting React and keeps the
 * component itself free of graph-derivation logic.
 */

import type { HubLink, SkillGroup, SkillNode } from '@/data/skills'

/** One drawn connection, as indices into the `SkillNode[]` array it was derived from. */
export interface SkillEdge {
  readonly from: number
  readonly to: number
}

/**
 * Builds the full edge list: one edge from each group's hub to every
 * member of that group, plus the hub-to-hub ring from `hubLinks`.
 * Mirrors the reference's own derivation (sample lines 958-962: build a
 * hub-index-by-group lookup, add a hub→member edge for every non-hub
 * node, then append the literal hub link pairs) — the only difference is
 * `hubLinks` here is keyed by group id rather than raw node-array index
 * (see `HUB_LINKS`'s own comment in `src/data/skills.ts`), so this
 * resolves each link's two group ids to their hub's current index first.
 */
export function deriveSkillEdges(nodes: readonly SkillNode[], hubLinks: readonly HubLink[]): readonly SkillEdge[] {
  const hubIndexByGroup = new Map<number, number>()
  nodes.forEach((node, index) => {
    if (node.hub) hubIndexByGroup.set(node.group, index)
  })

  const edges: SkillEdge[] = []

  nodes.forEach((node, index) => {
    if (node.hub) return
    const hubIndex = hubIndexByGroup.get(node.group)
    if (hubIndex === undefined) return
    edges.push({ from: hubIndex, to: index })
  })

  hubLinks.forEach((link) => {
    const from = hubIndexByGroup.get(link.from)
    const to = hubIndexByGroup.get(link.to)
    if (from === undefined || to === undefined) return
    edges.push({ from, to })
  })

  return edges
}

/**
 * The active node itself, plus every node directly connected to it by an
 * edge (reference's `near` set, sample lines 963-967). Empty when nothing
 * is active. Used to decide which nodes/edges stay at full opacity and
 * which dim.
 */
export function getNeighborIndices(edges: readonly SkillEdge[], activeIndex: number | null): ReadonlySet<number> {
  const neighbors = new Set<number>()
  if (activeIndex === null) return neighbors

  neighbors.add(activeIndex)
  edges.forEach((edge) => {
    if (edge.from === activeIndex) neighbors.add(edge.to)
    if (edge.to === activeIndex) neighbors.add(edge.from)
  })

  return neighbors
}

export interface NodeVisualState {
  /** This is the active node — grows and its border/label brighten. */
  readonly isActive: boolean
  /** Some other node is active and this one isn't in its neighbour set — dims to .28 opacity. */
  readonly isDimmed: boolean
}

/** Maps one node's index to its visual state, given the current active node and its neighbour set. */
export function getNodeVisualState(
  index: number,
  activeIndex: number | null,
  neighbors: ReadonlySet<number>,
): NodeVisualState {
  return {
    isActive: index === activeIndex,
    isDimmed: activeIndex !== null && !neighbors.has(index),
  }
}

export interface EdgeVisualState {
  /** This edge touches the active node — draws in `accent` at the thicker stroke width. */
  readonly isActive: boolean
}

/** Maps one edge to its visual state: lit up only when it touches the active node. */
export function getEdgeVisualState(edge: SkillEdge, activeIndex: number | null): EdgeVisualState {
  return {
    isActive: activeIndex !== null && (edge.from === activeIndex || edge.to === activeIndex),
  }
}

export interface SkillReadout {
  readonly name: string
  readonly groupLabel: string
  readonly note: string
  /** Whether this is a real node's readout (brighter name colour) vs. the default idle state. */
  readonly isActive: boolean
}

const DEFAULT_READOUT_NAME = 'SKILL GRAPH'

/**
 * Reworded from the reference's "Hover any node to see what I actually do
 * with it." (sample line 1052) — this graph's note is also reachable by
 * focus and by tap, so the default copy names all three instead of
 * implying a mouse is required (issue #319).
 */
const DEFAULT_READOUT_NOTE = 'Hover, focus, or tap any node to see what I actually do with it.'

/**
 * Derives the readout strip's content for the current active node (or the
 * idle default when nothing is active) — reference sample lines
 * 1050-1053. The idle `groupLabel` counts groups and non-hub nodes at
 * call time rather than hardcoding "4 CLUSTERS · 19 TOOLS", so it can
 * never drift from `SKILL_GROUPS`/`SKILL_NODES` again.
 */
export function getSkillReadout(
  nodes: readonly SkillNode[],
  groups: readonly SkillGroup[],
  activeIndex: number | null,
): SkillReadout {
  if (activeIndex !== null) {
    const node = nodes[activeIndex]
    const group = groups.find((candidate) => candidate.id === node.group)
    return {
      name: node.label,
      groupLabel: group?.name ?? '',
      note: node.note,
      isActive: true,
    }
  }

  const memberCount = nodes.filter((node) => !node.hub).length
  return {
    name: DEFAULT_READOUT_NAME,
    groupLabel: `${groups.length} CLUSTERS · ${memberCount} TOOLS`,
    note: DEFAULT_READOUT_NOTE,
    isActive: false,
  }
}
