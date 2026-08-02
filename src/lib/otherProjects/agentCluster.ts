/**
 * Pure frame-to-model logic for the thesis's agent-dot cluster (issue
 * #318). The widget illustrates the thesis's own premise — a simulated
 * organization of LLM agents, most going about ordinary business, one
 * occasionally standing out as a flagged insider threat — without a
 * paragraph of explanation.
 *
 * No timer and no DOM here: given a tick count and how many agents to
 * model, this returns exactly which state each agent dot is in this
 * frame. The React component (`AgentCluster.tsx`) owns the `setInterval`
 * and feeds its own tick count in on every render, the same split used by
 * `src/lib/leviathan/pipeline.ts` for the inference-pipeline widget — kept
 * separate so this logic is unit-testable without mounting React, and so
 * a frame tick only re-renders this leaf widget.
 */

export type AgentState = 'idle' | 'active' | 'flagged'

export interface AgentDotModel {
  readonly id: number
  readonly state: AgentState
}

/** Frames in one personal cycle for a single agent dot. */
export const AGENT_CYCLE_LENGTH = 24

/** Within a cycle, the frame at which an agent moves from idle to active. */
const ACTIVE_FROM_FRAME = 15

/** Within a cycle, the last few frames a flaggable agent spends flagged. */
const FLAGGED_FROM_FRAME = AGENT_CYCLE_LENGTH - 3

/** Every Nth agent (by index) is capable of being flagged at all — most agents never are. */
const FLAGGABLE_STRIDE = 7

/** Spreads each agent's cycle out relative to its neighbours, so the cluster never moves in lockstep. */
const PHASE_OFFSET_STRIDE = 5

/** Wraps a tick into `[0, AGENT_CYCLE_LENGTH)`, even for a negative tick. */
function wrapPhase(tick: number): number {
  return ((tick % AGENT_CYCLE_LENGTH) + AGENT_CYCLE_LENGTH) % AGENT_CYCLE_LENGTH
}

function isFlaggable(index: number): boolean {
  return index % FLAGGABLE_STRIDE === 0
}

function stateForPhase(phase: number, flaggable: boolean): AgentState {
  if (flaggable && phase >= FLAGGED_FROM_FRAME) return 'flagged'
  if (phase >= ACTIVE_FROM_FRAME) return 'active'
  return 'idle'
}

/**
 * Computes every agent dot's state at a given tick.
 *
 * @param tick ever-increasing frame counter (the component's own state)
 * @param agentCount number of agent dots to model
 */
export function computeAgentClusterFrame(tick: number, agentCount: number): readonly AgentDotModel[] {
  const dots: AgentDotModel[] = []
  for (let index = 0; index < agentCount; index++) {
    const offset = (index * PHASE_OFFSET_STRIDE) % AGENT_CYCLE_LENGTH
    const phase = wrapPhase(tick + offset)
    dots.push({ id: index, state: stateForPhase(phase, isFlaggable(index)) })
  }
  return dots
}

/**
 * The single settled frame rendered under a reduced-motion preference: one
 * frame from the loop, with no timer running behind it. Because each
 * agent's phase is offset from its neighbours, a single fixed tick still
 * shows a mix of idle, active, and (for a flaggable agent) flagged dots —
 * the cluster reads as "populated," not frozen mid-blank.
 */
export function settledAgentClusterFrame(agentCount: number): readonly AgentDotModel[] {
  return computeAgentClusterFrame(AGENT_CYCLE_LENGTH - 1, agentCount)
}
