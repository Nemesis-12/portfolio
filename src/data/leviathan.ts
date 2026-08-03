/**
 * Leviathan featured-project content: hook, bullets, headline stats, links,
 * and the illustrative data driving the inference-pipeline widget (issue
 * #317).
 *
 * Every headline figure below is sourced from `public/resume.pdf` (Projects
 * > Leviathan). Where the design reference (`ideas/Portfolio.html`,
 * gitignored, local-only) disagreed with the resume, the resume would win
 * — in practice every figure here matched the reference exactly:
 *
 *   - 19ms per-move latency  — resume: "…19ms per-move latency…"
 *   - 20M parameters         — resume: "20M-parameter transformer…"
 *   - 3M+ positions trained  — resume: "Trained on 3M+ chess positions…"
 *   - 8x KV-cache reduction  — resume: "Reduced KV-cache memory footprint
 *                              by 8× through Multi-Head Latent Attention…"
 *   - 4,247-token vocabulary — resume: "…into 4,247-token vocabulary for
 *                              single-token move prediction."
 *
 * The chess position, token ids, and candidate move sets used by the
 * pipeline widget are illustrative — they demonstrate the *shape* of the
 * pipeline (a real FEN, plausible token ids, plausible policy candidates),
 * not a specific factual claim from the resume.
 */

export interface LeviathanStat {
  readonly id: string
  readonly target: number
  readonly suffix: string
  readonly label: string
  /** Full accessible name, independent of the count-up's current frame. */
  readonly accessibleName: string
}

export interface LeviathanLink {
  readonly label: string
  readonly href: string
}

export interface PipelineCandidate {
  readonly move: string
  readonly percent: number
}

export const LEVIATHAN_HOOK = 'It never searches. It just knows.'

/**
 * Badge next to the project name (sample line 343: "SHIPPED · 2025").
 * Resume: Leviathan's project dates are "Jan 2025 – Dec 2025", so the
 * project shipped within 2025.
 */
export const LEVIATHAN_BADGE = 'SHIPPED · 2025'

export const LEVIATHAN_SUBTITLE = 'searchless transformer chess engine'

export const LEVIATHAN_SUMMARY =
  'A 20M-parameter transformer that picks its move in one forward pass — no search tree, no opening book. Tuned to run inference on an 8GB RTX 4060, because renting an H100 to play chess felt excessive.'

/** Memory, tokenizer, training — the three engineering decisions worth judging. */
export const LEVIATHAN_BULLETS: readonly string[] = [
  'Multi-Head Latent Attention cuts KV-cache memory 8×, unlocking batched inference.',
  'A custom tokenizer folds board state and UCI notation into a 4,247-token vocabulary.',
  'Gradient checkpointing and FP16 push 3M+ positions through consumer hardware.',
]

/**
 * Headline stats. `target`/`suffix` drive the count-up display;
 * `accessibleName` is the full, final figure and is what the DOM exposes
 * to assistive tech at all times — it never depends on animation state.
 */
export const LEVIATHAN_STATS: readonly LeviathanStat[] = [
  {
    id: 'latency',
    target: 19,
    suffix: 'ms',
    label: 'PER MOVE',
    accessibleName: '19 milliseconds per move',
  },
  {
    id: 'params',
    target: 20,
    suffix: 'M',
    label: 'PARAMS',
    accessibleName: '20 million parameters',
  },
  {
    id: 'positions',
    target: 3,
    suffix: 'M+',
    label: 'POSITIONS',
    accessibleName: '3 million plus positions trained',
  },
]

/**
 * Source and live demo. The resume links the "Leviathan" project heading
 * itself to its HuggingFace Space — that is the only URL the resume gives
 * for this project; it does not separately name a source repository (unlike
 * the MLA project below it, which lists GitHub and PyPI links explicitly).
 *
 * A HuggingFace Space is itself a git repository with a browsable Files
 * tab, so the same Space serves as both the source link and the live demo
 * here. That is a documented decision reusing the resume's one real URL,
 * not an invented one.
 */
export const LEVIATHAN_LINKS: readonly LeviathanLink[] = [
  { label: 'source', href: 'https://huggingface.co/spaces/NemesisTCO/LeviathanChess/tree/main' },
  { label: 'live demo', href: 'https://huggingface.co/spaces/NemesisTCO/LeviathanChess' },
]

/** Illustrative input position for the pipeline widget — a legal FEN, not a resume claim. */
export const PIPELINE_POSITION_FEN = 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R'

/** Illustrative token ids for the tokenizer stage — shape only, not a resume claim. */
export const PIPELINE_TOKEN_IDS: readonly string[] = [
  '1102',
  '87',
  '3391',
  '44',
  '2210',
  '918',
  '76',
  '4247',
  '12',
]

/** Illustrative candidate move sets the policy stage rotates through between loops. */
export const PIPELINE_CANDIDATE_SETS: readonly (readonly PipelineCandidate[])[] = [
  [
    { move: 'Nf3', percent: 71 },
    { move: 'e4', percent: 18 },
    { move: 'Bb5', percent: 6 },
  ],
  [
    { move: 'O-O', percent: 64 },
    { move: 'd4', percent: 22 },
    { move: 'Nc3', percent: 9 },
  ],
  [
    { move: 'Bb5', percent: 58 },
    { move: 'Qe2', percent: 27 },
    { move: 'h3', percent: 11 },
  ],
  [
    { move: 'Rd1', percent: 66 },
    { move: 'c3', percent: 21 },
    { move: 'Nf3', percent: 8 },
  ],
]

/** Resume: "…19ms per-move latency…" — reused as the pipeline's output caption. */
export const PIPELINE_OUTPUT_META = '19 ms · one forward pass'
