/**
 * Pure frame-to-model logic for the Leviathan inference-pipeline widget
 * (issue #317).
 *
 * The widget loops a fixed-length frame counter and, at each tick, reveals
 * more of the position scan, then tokens, then attention rows, then the
 * policy candidates, then the output move — looping back to the start.
 * This module has no timer and no DOM: given a tick count and the sizes of
 * the data being revealed, it returns exactly what should be visible.
 *
 * The React component (`InferencePipeline.tsx`) owns the `setInterval`
 * and feeds its own tick count into `computePipelineFrame` on every
 * render — that split is what keeps this logic unit-testable in isolation
 * and keeps a frame tick from re-rendering anything above the widget.
 */

export const PIPELINE_STAGES = ['position', 'tokens', 'attention', 'policy', 'move'] as const
export type PipelineStage = (typeof PIPELINE_STAGES)[number]

/** Total frames in one loop of the pipeline animation. */
export const PIPELINE_LOOP_LENGTH = 84

/** Number of attention rows revealed at full reveal (a 10-row grid). */
export const ATTENTION_ROW_COUNT = 10

/**
 * Frames-per-row divisor for the attention reveal. Deliberately not derived
 * from the attention stage's span: the reveal is meant to finish a few
 * frames before the policy stage starts (frame 49 of 54), leaving the fully
 * revealed "every token reads..." caption to dwell on screen — the visual
 * argument for "it never searches" needs a beat to land before the next
 * stage takes over.
 */
const ATTENTION_REVEAL_FRAME_DIVISOR = 2.2

/** The frame at which each stage starts becoming active, within one loop. */
const STAGE_START_FRAME: Record<PipelineStage, number> = {
  position: 0,
  tokens: 18,
  attention: 28,
  policy: 54,
  move: 64,
}

export interface PipelineFrameModel {
  readonly frame: number
  readonly cycle: number
  readonly stage: PipelineStage
  readonly positionRevealCount: number
  readonly tokensRevealedCount: number
  readonly attentionRowsRevealed: number
  readonly policyRevealed: boolean
  readonly moveRevealed: boolean
}

/**
 * Wraps an ever-increasing tick count into a frame within one loop.
 * Always returns a value in `[0, loopLength)`, even for a negative tick.
 */
export function frameForTick(tick: number, loopLength: number = PIPELINE_LOOP_LENGTH): number {
  return ((tick % loopLength) + loopLength) % loopLength
}

/** Which loop iteration `tick` falls in — used to rotate the policy candidates shown each loop. */
export function cycleForTick(tick: number, loopLength: number = PIPELINE_LOOP_LENGTH): number {
  return Math.floor(tick / loopLength)
}

/** The active stage for a given frame within one loop. */
export function stageAtFrame(frame: number): PipelineStage {
  if (frame >= STAGE_START_FRAME.move) return 'move'
  if (frame >= STAGE_START_FRAME.policy) return 'policy'
  if (frame >= STAGE_START_FRAME.attention) return 'attention'
  if (frame >= STAGE_START_FRAME.tokens) return 'tokens'
  return 'position'
}

/**
 * Computes what should be visible at a given tick.
 *
 * @param tick ever-increasing frame counter (the component's own state)
 * @param positionLength number of characters in the position string being scanned
 * @param tokenCount number of tokens to reveal
 * @param loopLength frames per loop
 */
export function computePipelineFrame(
  tick: number,
  positionLength: number,
  tokenCount: number,
  loopLength: number = PIPELINE_LOOP_LENGTH,
): PipelineFrameModel {
  const frame = frameForTick(tick, loopLength)
  const cycle = cycleForTick(tick, loopLength)
  const stage = stageAtFrame(frame)

  const positionRevealCount = Math.min(
    positionLength,
    Math.round((Math.min(frame, STAGE_START_FRAME.tokens) / STAGE_START_FRAME.tokens) * positionLength),
  )

  const tokensRevealedCount =
    frame < STAGE_START_FRAME.tokens ? 0 : Math.min(tokenCount, frame - STAGE_START_FRAME.tokens + 1)

  const attentionRowsRevealed =
    frame < STAGE_START_FRAME.attention
      ? 0
      : Math.min(
          ATTENTION_ROW_COUNT,
          Math.floor((frame - STAGE_START_FRAME.attention + 1) / ATTENTION_REVEAL_FRAME_DIVISOR),
        )

  const policyRevealed = frame >= STAGE_START_FRAME.policy
  const moveRevealed = frame >= STAGE_START_FRAME.move

  return {
    frame,
    cycle,
    stage,
    positionRevealCount,
    tokensRevealedCount,
    attentionRowsRevealed,
    policyRevealed,
    moveRevealed,
  }
}

/** Picks which candidate move set to show this loop, rotating deterministically by cycle. */
export function candidateSetIndexForCycle(cycle: number, setCount: number): number {
  if (setCount <= 0) return 0
  return ((cycle % setCount) + setCount) % setCount
}

/**
 * The single settled frame rendered under a reduced-motion preference: the
 * loop's final frame, fully resolved (every stage revealed), with no timer
 * running behind it. Rendering the end state rather than the start state
 * means a reduced-motion visitor still sees the complete pipeline output —
 * not a widget stuck perpetually mid-reveal.
 */
export function settledPipelineFrame(positionLength: number, tokenCount: number): PipelineFrameModel {
  return computePipelineFrame(PIPELINE_LOOP_LENGTH - 1, positionLength, tokenCount)
}
