import { useEffect, useState } from 'react'
import { AGENT_DOT_COUNT } from '@/data/otherProjects'
import { cn } from '@/lib/cn'
import {
  type AgentState,
  computeAgentClusterFrame,
  settledAgentClusterFrame,
} from '@/lib/otherProjects/agentCluster'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const FRAME_INTERVAL_MS = 260

const STATE_CLASS: Record<AgentState, string> = {
  idle: 'bg-dim-3',
  active: 'bg-accent-2',
  flagged: 'bg-accent',
}

/**
 * Illustrates the thesis's own premise — a simulated organization of LLM
 * agents, most idle or ordinarily active, occasionally one flagged as an
 * insider threat — without a paragraph of explanation (issue #318).
 *
 * Owns its own state and timer, scoped to this widget, so a frame tick
 * re-renders only this cluster, not the section around it. Frame-to-model
 * logic is a pure function (`computeAgentClusterFrame` in
 * `src/lib/otherProjects/agentCluster.ts`); this component only owns the
 * ticking clock and paints whatever that function says is true this
 * frame — the same split `InferencePipeline` uses for the featured screen.
 *
 * Reduced motion: no timer is started at all. `settledAgentClusterFrame`
 * renders one fixed, already-varied frame (idle, active, and a flagged dot
 * all present at once) rather than a blank or frozen-mid-reveal cluster.
 *
 * Each dot's state is exposed via `data-agent-state` rather than through
 * its colour class alone — that is what the tests assert against (a
 * behavioural, model-driven attribute), never the Tailwind class name
 * itself.
 */
export function AgentCluster({ className }: { className?: string } = {}) {
  const reducedMotion = usePrefersReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    const id = setInterval(() => setTick((t) => t + 1), FRAME_INTERVAL_MS)
    return () => clearInterval(id)
  }, [reducedMotion])

  const dots = reducedMotion
    ? settledAgentClusterFrame(AGENT_DOT_COUNT)
    : computeAgentClusterFrame(tick, AGENT_DOT_COUNT)

  return (
    <div
      role="group"
      aria-label="Simulated organization of LLM agents: mostly idle or active, one occasionally flagged as an insider threat"
      className={cn('flex flex-wrap gap-[6px]', className)}
    >
      {dots.map((dot) => (
        <span
          key={dot.id}
          aria-hidden="true"
          data-agent-state={dot.state}
          className={cn('h-3 w-3 rounded-full transition-colors duration-300', STATE_CLASS[dot.state])}
        />
      ))}
    </div>
  )
}
