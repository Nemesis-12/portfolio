import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  PIPELINE_CANDIDATE_SETS,
  PIPELINE_OUTPUT_META,
  PIPELINE_POSITION_FEN,
  PIPELINE_TOKEN_IDS,
} from '@/data/leviathan'
import {
  ATTENTION_ROW_COUNT,
  candidateSetIndexForCycle,
  computePipelineFrame,
  settledPipelineFrame,
} from '@/lib/leviathan/pipeline'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const FRAME_INTERVAL_MS = 120

function PipelineRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span className="whitespace-nowrap text-2xs tracking-[0.18em] text-dim-3">{label}</span>
      {children}
    </>
  )
}

/**
 * The inference-pipeline widget: position → tokens → attention → policy →
 * move, looping continuously on its own frame counter (issue #317). This
 * is the visual argument for a searchless engine -- there is no search
 * tree to show, only one forward pass revealing itself stage by stage.
 *
 * Owns its own state and timer, scoped to this component, so a frame tick
 * re-renders this widget only -- not the section around it. Frame-to-model
 * logic itself is a pure function (`computePipelineFrame` in
 * `src/lib/leviathan/pipeline.ts`); this component only owns the ticking
 * clock and renders whatever that function says is visible this frame.
 *
 * Reduced motion: no timer is started at all. `settledPipelineFrame`
 * renders the loop's *final* frame -- every stage fully resolved -- once,
 * statically. That is a deliberate choice over the alternative of freezing
 * on frame 0 (which would show a widget that looks permanently broken) or
 * reproducing the reference's blanket duration-zeroing (which plays the
 * loop instantly rather than not at all, the opposite of what the
 * preference asks for).
 */
export function InferencePipeline() {
  const reducedMotion = usePrefersReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    const id = setInterval(() => setTick((t) => t + 1), FRAME_INTERVAL_MS)
    return () => clearInterval(id)
  }, [reducedMotion])

  const frameModel = reducedMotion
    ? settledPipelineFrame(PIPELINE_POSITION_FEN.length, PIPELINE_TOKEN_IDS.length)
    : computePipelineFrame(tick, PIPELINE_POSITION_FEN.length, PIPELINE_TOKEN_IDS.length)

  const candidateIndex = candidateSetIndexForCycle(frameModel.cycle, PIPELINE_CANDIDATE_SETS.length)
  const candidates = PIPELINE_CANDIDATE_SETS[candidateIndex]
  const topCandidate = candidates[0]

  const positionShown = PIPELINE_POSITION_FEN.slice(0, frameModel.positionRevealCount)
  const tokensShown = PIPELINE_TOKEN_IDS.slice(0, frameModel.tokensRevealedCount)

  return (
    <div
      role="group"
      aria-label="Inference pipeline: position to tokens to attention to policy to move"
      className="grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-[var(--space-2xs)] gap-y-[var(--space-xs)]"
    >
      <PipelineRow label="position">
        <span aria-hidden="true" className="break-all font-mono text-2xs text-fg-2">
          {positionShown || ' '}
        </span>
      </PipelineRow>

      <PipelineRow label="tokens">
        <div aria-hidden="true" className="flex flex-wrap gap-[var(--space-3xs)]">
          {tokensShown.map((id, index) => (
            <span
              key={`${id}-${index}`}
              className="border border-line-2 bg-panel px-2 py-[2px] font-mono text-2xs text-accent-2"
            >
              {id}
            </span>
          ))}
        </div>
      </PipelineRow>

      <PipelineRow label="attention">
        <div aria-hidden="true" className="text-2xs text-dim-2">
          {frameModel.attentionRowsRevealed >= ATTENTION_ROW_COUNT
            ? 'every token reads the ones before it — KV cache compressed 8×'
            : 'each row = one token deciding which earlier tokens matter'}
        </div>
      </PipelineRow>

      <PipelineRow label="policy">
        <div aria-hidden="true" className="flex flex-col gap-[var(--space-3xs)]">
          {candidates.map((candidate) => (
            <div key={candidate.move} className="flex items-center gap-[var(--space-2xs)] text-2xs">
              <span className="min-w-[3.5em] font-display text-dim-3">
                {frameModel.policyRevealed ? candidate.move : ''}
              </span>
              <span className="text-dim-2">{frameModel.policyRevealed ? `${candidate.percent}%` : ''}</span>
            </div>
          ))}
        </div>
      </PipelineRow>

      <PipelineRow label="move">
        <div aria-hidden="true" className="flex items-baseline gap-[var(--space-xs)]">
          <span className="font-display text-fluid-lg text-fg">
            {frameModel.moveRevealed ? topCandidate.move : '···'}
          </span>
          <span className="text-2xs text-dim-2">{frameModel.moveRevealed ? PIPELINE_OUTPUT_META : ''}</span>
        </div>
      </PipelineRow>
    </div>
  )
}
