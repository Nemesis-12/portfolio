import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  PIPELINE_CANDIDATE_SETS,
  PIPELINE_OUTPUT_META,
  PIPELINE_POSITION_FEN,
  PIPELINE_TOKEN_IDS,
} from '@/data/leviathan'
import { cn } from '@/lib/cn'
import {
  ATTENTION_ROW_COUNT,
  candidateSetIndexForCycle,
  computePipelineFrame,
  settledPipelineFrame,
} from '@/lib/leviathan/pipeline'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const FRAME_INTERVAL_MS = 120

/** Total cells in the attention grid (sample line 384: `hint-placeholder-count="100"`), 10x10. */
const ATTENTION_CELL_COUNT = ATTENTION_ROW_COUNT * ATTENTION_ROW_COUNT

/**
 * One pipeline row: a `66px minmax(0,1fr)` grid (sample lines 362, 371,
 * 380, 392, 405) pairing the row's dim label with its content. `align`
 * lets the attention/policy rows start-align their taller content while
 * position/tokens/move stay baseline-centered, same as the sample.
 */
function PipelineRow({
  label,
  children,
  align = 'center',
  labelPaddingTop,
}: {
  label: string
  children: ReactNode
  align?: 'center' | 'start'
  labelPaddingTop?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[66px_minmax(0,1fr)] gap-x-3',
        align === 'center' ? 'items-center' : 'items-start',
      )}
    >
      <span
        style={labelPaddingTop ? { paddingTop: labelPaddingTop } : undefined}
        className="whitespace-nowrap text-2xs tracking-[0.18em] text-dim-3"
      >
        {label}
      </span>
      {children}
    </div>
  )
}

/**
 * The inference-pipeline widget: position -> tokens -> attention -> policy
 * -> move, looping continuously on its own frame counter (issue #317).
 * This is the visual argument for a searchless engine -- there is no
 * search tree to show, only one forward pass revealing itself stage by
 * stage.
 *
 * Owns its own state and timer, scoped to this component, so a frame tick
 * re-renders this widget only -- not the section around it. Frame-to-model
 * logic itself is a pure function (`computePipelineFrame` in
 * `src/lib/leviathan/pipeline.ts`); this component only owns the ticking
 * clock and renders whatever that function says is visible this frame.
 * That logic is unchanged by this pass (mochi/style-match audit) -- only
 * the DOM/CSS shape of each row is restyled to match the sample verbatim
 * (lines 362-411: each row is its own `66px minmax(0,1fr)` grid, the
 * attention stage is a real 10x10 cell grid rather than a caption-only
 * placeholder, and the policy stage renders an actual percentage bar per
 * candidate).
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
  const revealedAttentionCells = frameModel.attentionRowsRevealed * ATTENTION_ROW_COUNT

  return (
    <div
      role="group"
      aria-label="Inference pipeline: position to tokens to attention to policy to move"
      className="flex flex-col gap-[clamp(10px,2vh,22px)]"
    >
      <PipelineRow label="position">
        <span aria-hidden="true" className="flex flex-wrap text-[clamp(9px,1.4vh,13px)]">
          {(positionShown || ' ').split('').map((ch, index) => (
            <span key={index} className="font-mono text-fg-2">
              {ch}
            </span>
          ))}
        </span>
      </PipelineRow>

      <PipelineRow label="tokens">
        <div aria-hidden="true" className="flex flex-wrap gap-[5px]">
          {tokensShown.map((id, index) => (
            <span
              key={`${id}-${index}`}
              className="border border-line-2 bg-panel px-2 py-[clamp(2px,0.5vh,4px)] text-fit-2xs font-mono text-accent-2"
            >
              {id}
            </span>
          ))}
        </div>
      </PipelineRow>

      <PipelineRow label="attention" align="start" labelPaddingTop="3px">
        <div className="flex min-w-0 flex-col gap-2">
          <div aria-hidden="true" className="grid w-[min(100%,19vh)] grid-cols-10 gap-[2px]">
            {Array.from({ length: ATTENTION_CELL_COUNT }, (_, index) => (
              <span
                key={index}
                className={cn(
                  'aspect-square transition-colors duration-300',
                  index < revealedAttentionCells ? 'bg-accent' : 'bg-line',
                )}
              />
            ))}
          </div>
          <div className="text-[11px] leading-[1.5] text-dim-2">
            {frameModel.attentionRowsRevealed >= ATTENTION_ROW_COUNT
              ? 'every token reads the ones before it — KV cache compressed 8×'
              : 'each row = one token deciding which earlier tokens matter'}
          </div>
        </div>
      </PipelineRow>

      <PipelineRow label="policy" align="start" labelPaddingTop="4px">
        <div aria-hidden="true" className="flex flex-col gap-2">
          {candidates.map((candidate, index) => (
            <div key={candidate.move} className="flex items-center gap-[11px]">
              <span className="min-w-[50px] font-display text-[10.5px] text-dim-3">
                {frameModel.policyRevealed ? candidate.move : ''}
              </span>
              <span className="relative h-[7px] flex-1 overflow-hidden bg-line">
                <span
                  className={cn(
                    'absolute inset-y-0 left-0 transition-[width]',
                    index === 0 ? 'bg-accent' : 'bg-dim-3',
                  )}
                  style={{ width: frameModel.policyRevealed ? `${candidate.percent}%` : '0%' }}
                />
              </span>
              <span className="min-w-[40px] text-right text-[11px] text-dim-2">
                {frameModel.policyRevealed ? `${candidate.percent}%` : ''}
              </span>
            </div>
          ))}
        </div>
      </PipelineRow>

      <PipelineRow label="move">
        <div className="flex items-baseline gap-[clamp(12px,2vw,22px)] border-t border-line pt-[clamp(9px,1.5vh,14px)]">
          <span aria-hidden="true" className="font-display text-[clamp(16px,3vh,30px)] text-fg">
            {frameModel.moveRevealed ? topCandidate.move : '···'}
          </span>
          <span className="text-[11.5px] text-dim-2">{frameModel.moveRevealed ? PIPELINE_OUTPUT_META : ''}</span>
        </div>
      </PipelineRow>
    </div>
  )
}
