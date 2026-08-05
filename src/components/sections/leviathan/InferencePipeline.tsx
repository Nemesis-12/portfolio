import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  PIPELINE_CANDIDATE_SETS,
  PIPELINE_OUTPUT_META,
  PIPELINE_POSITION_FEN,
  PIPELINE_TOKEN_IDS,
} from '@/data/leviathan'
import { cn } from '@/lib/cn'
import { startIntervalTick } from '@/lib/intervalTick'
import {
  ATTENTION_ROW_COUNT,
  buildAttentionCellModels,
  buildFenCharModels,
  buildTokenModels,
  candidateSetIndexForCycle,
  computePipelineFrame,
  settledPipelineFrame,
} from '@/lib/leviathan/pipeline'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

/** Frame tick cadence (sample line 703: `setInterval(..., 110)`). */
const FRAME_INTERVAL_MS = 110

/**
 * One pipeline row: a `66px minmax(0,1fr)` grid (sample lines 362, 371,
 * 380, 392, 405) pairing the row's dim label with its content. `align`
 * lets the attention/policy rows start-align their taller content while
 * position/tokens/move stay baseline-centered, same as the sample. The
 * `move` row's border-top and top padding sit on this outer grid (sample
 * line 405: `border-top:1px solid var(--line);padding-top:...` is on the
 * row itself, not on the content column), so `rowBorderTop` lets that one
 * row opt in without affecting the others.
 */
function PipelineRow({
  label,
  children,
  align = 'center',
  labelPaddingTop,
  rowBorderTop = false,
}: {
  label: string
  children: ReactNode
  align?: 'center' | 'start'
  labelPaddingTop?: string
  rowBorderTop?: boolean
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-[66px_minmax(0,1fr)] gap-x-3',
        align === 'center' ? 'items-center' : 'items-start',
        rowBorderTop && 'border-t border-line pt-[clamp(9px,1.5vh,14px)]',
      )}
    >
      <span
        style={labelPaddingTop ? { paddingTop: labelPaddingTop } : undefined}
        className="whitespace-nowrap text-[9.5px] tracking-[0.18em] text-dim-3"
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
    if (reducedMotion) return undefined
    return startIntervalTick(() => setTick((t) => t + 1), FRAME_INTERVAL_MS)
  }, [reducedMotion])

  const frameModel = reducedMotion
    ? settledPipelineFrame(PIPELINE_POSITION_FEN.length, PIPELINE_TOKEN_IDS.length)
    : computePipelineFrame(tick, PIPELINE_POSITION_FEN.length, PIPELINE_TOKEN_IDS.length)

  const candidateIndex = candidateSetIndexForCycle(frameModel.cycle, PIPELINE_CANDIDATE_SETS.length)
  const candidates = PIPELINE_CANDIDATE_SETS[candidateIndex]
  const topCandidate = candidates[0]

  const fenChars = buildFenCharModels(PIPELINE_POSITION_FEN, frameModel.positionRevealCount)
  const tokenCells = buildTokenModels(PIPELINE_TOKEN_IDS, frameModel.tokensRevealedCount)
  const attentionCells = buildAttentionCellModels(frameModel.attentionRowsRevealed)

  return (
    <div
      role="group"
      aria-label="Inference pipeline: position to tokens to attention to policy to move"
      className="flex flex-col gap-[clamp(10px,2vh,22px)]"
    >
      <PipelineRow label="position">
        {/* min-w-0: each char is its own flex item so this already wraps freely, but the container still needs permission to shrink below its content's width. */}
        <span aria-hidden="true" className="flex min-w-0 flex-wrap text-[clamp(9px,1.4vh,13px)]">
          {fenChars.map((cell, index) => (
            <span
              key={index}
              className={cn('font-mono transition-[color,background-color] duration-150', cell.revealed ? 'text-fg' : 'text-line-2')}
              style={{ backgroundColor: cell.isCursor ? 'rgb(var(--accent))' : 'transparent' }}
            >
              {cell.ch}
            </span>
          ))}
        </span>
      </PipelineRow>

      <PipelineRow label="tokens">
        <div aria-hidden="true" className="flex min-w-0 flex-wrap gap-[5px]">
          {tokenCells.map((cell, index) => (
            <span
              key={index}
              className={cn(
                'border text-fit-2xs font-mono transition-all duration-200',
                'px-2 py-[clamp(2px,0.5vh,4px)]',
                cell.revealed ? 'border-line-2 bg-panel text-accent-2' : 'border-line bg-transparent text-line-2',
              )}
              style={{ transform: cell.revealed ? 'translateY(0)' : 'translateY(5px)' }}
            >
              {cell.id}
            </span>
          ))}
        </div>
      </PipelineRow>

      <PipelineRow label="attention" align="start" labelPaddingTop="3px">
        <div className="flex min-w-0 flex-col gap-2">
          <div aria-hidden="true" className="grid w-[min(100%,19vh)] grid-cols-10 gap-[2px]">
            {attentionCells.map((cell, index) => (
              <span
                key={index}
                className="aspect-square transition-colors duration-300"
                style={{ backgroundColor: `rgb(var(--accent) / ${cell.intensity})` }}
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
          {candidates.map((candidate, index) => {
            const isTop = index === 0
            return (
              <div key={candidate.move} className="flex items-center gap-[11px]">
                <span
                  className={cn(
                    'min-w-[50px] font-display text-[10.5px] transition-colors duration-300',
                    frameModel.policyRevealed && isTop ? 'text-accent-2' : 'text-dim-3',
                  )}
                >
                  {candidate.move}
                </span>
                <span className="relative h-[7px] flex-1 overflow-hidden bg-line">
                  <span
                    className={cn(
                      'absolute inset-y-0 left-0 transition-[width,background-color] duration-300',
                      isTop ? 'bg-accent' : 'bg-line-2',
                    )}
                    style={{ width: frameModel.policyRevealed ? `${candidate.percent}%` : '0%' }}
                  />
                </span>
                <span
                  className={cn(
                    'min-w-[40px] text-right text-[11px] transition-colors duration-300',
                    frameModel.policyRevealed && isTop ? 'text-fg' : 'text-dim-3',
                  )}
                >
                  {frameModel.policyRevealed ? `${candidate.percent}%` : ''}
                </span>
              </div>
            )
          })}
        </div>
      </PipelineRow>

      <PipelineRow label="move" rowBorderTop>
        <div className="flex flex-wrap items-baseline gap-[clamp(12px,2vw,22px)]">
          <span
            aria-hidden="true"
            className={cn(
              'font-display text-[clamp(16px,3vh,30px)] transition-colors duration-300',
              frameModel.moveRevealed ? 'text-fg' : 'text-line-2',
            )}
          >
            {frameModel.moveRevealed ? topCandidate.move : '···'}
          </span>
          <span className="text-[11.5px] text-dim-2">{frameModel.moveRevealed ? PIPELINE_OUTPUT_META : ''}</span>
        </div>
      </PipelineRow>
    </div>
  )
}
