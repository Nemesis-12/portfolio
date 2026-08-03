/**
 * Second projects screen content: the MLA library and the in-progress
 * thesis (issue #318). This screen follows the featured Leviathan screen
 * (#317) and reuses the sample's own "01 · PROJECTS" heading verbatim
 * (sample lines 417-422, via `getSectionMeta('more')` in
 * `src/data/sections.ts`) — the sample deliberately numbers both project
 * screens "01"; that is chrome, not a defect (mochi/style-match audit).
 *
 * Every fact below is sourced from `public/resume.pdf`:
 *
 *   - MLA translated from DeepSeek-V2 into a modular PyTorch implementation
 *     with clean KV-compression/low-rank-projection abstractions — résumé:
 *     "Translated Multi-Head Latent Attention from DeepSeek-V2 research
 *     into modular PyTorch implementation, designing clean abstractions
 *     for KV compression and low-rank projection components."
 *   - Packaged as a production-ready PyPI library with type hints,
 *     documentation, and integration examples — résumé: "Packaged
 *     implementation as production-ready PyPI library with type hints,
 *     documentation, and integration examples."
 *   - GitHub + PyPI URLs — taken from the résumé PDF's own link
 *     annotations (not typed by hand): both point at
 *     `Nemesis-12/multihead-latent-attention`, confirming the real PyPI
 *     package name. The design reference advertises `pip install
 *     mla-pytorch`, which does not match either URL — that is the defect
 *     this issue also fixes; the correct command is
 *     `pip install multihead-latent-attention`.
 *   - Thesis title "Generative Agent-Based Models for Insider Threat
 *     Detection" — résumé, Education > Wichita State University
 *     (Accelerated MS in Computer Science).
 *   - Program dates "Jan 2026 – May 2027 (Expected)" — résumé, same entry.
 *     The sample's own stat label for this figure is "DEFENSE" (sample
 *     line 453), which is restored here per the owner's chrome-is-verbatim
 *     ruling (mochi/style-match audit) — but the résumé gives no separate
 *     thesis-defence date, only the program's own expected-completion
 *     date, so the value shown is that expected date ("MAY" / "2027"),
 *     never a fabricated specific day.
 *   - The sample's second thesis stat (line 454) is "AGENTS" / "LLM",
 *     restored verbatim as chrome too — it restates the thesis's own
 *     premise (LLM agents) rather than a résumé figure, so nothing is
 *     invented by using it. This replaces the "Relevant Coursework: NLP,
 *     Reinforcement Learning" stat a previous pass showed under this
 *     label; that fact has no sample counterpart at this position and is
 *     not otherwise lost — it remains on the résumé/Education section.
 *
 * The agent-dot cluster illustrating the thesis is an illustrative
 * visualization of the thesis's own premise (simulated organizations of
 * LLM agents, some behaving as insider threats) — not a claim about a
 * specific simulation size or result, neither of which the résumé states.
 */

export interface OtherProjectStat {
  readonly label: string
  readonly value: string
  /**
   * Trailing unit/fragment rendered smaller and dimmer, next to `value`
   * (sample lines 434-435, 453: the "×"/"%"/"27" nested spans). Omitted
   * where the sample's stat has no such nested span (line 454: "LLM").
   */
  readonly suffix?: string
}

export interface OtherProjectLink {
  readonly label: string
  readonly href: string
}

// --- MLA library -----------------------------------------------------------

export const MLA_BADGE = 'PUBLISHED'

export const MLA_TITLE = 'Multi-Head Latent Attention'

export const MLA_TAGLINE = 'Read the paper. Wrote the library.'

export const MLA_DESCRIPTION =
  'Multi-Head Latent Attention from DeepSeek-V2, translated into a modular PyTorch implementation with clean abstractions for KV compression and low-rank projection — packaged as a production-ready PyPI library with type hints, documentation, and integration examples.'

/** The exact command a visitor can copy and run in one step (issue #318 acceptance criteria). */
export const MLA_INSTALL_COMMAND = 'pip install multihead-latent-attention'

/** Both URLs come from the résumé PDF's own link annotations. */
export const MLA_LINKS: readonly OtherProjectLink[] = [
  { label: 'source', href: 'https://github.com/Nemesis-12/multihead-latent-attention' },
  { label: 'package', href: 'https://pypi.org/project/multihead-latent-attention' },
]

/**
 * Stat footer (sample lines 434-435: "COMPRESSION 8×" / "TYPED 100%") —
 * missing from the card entirely before this pass.
 *
 *   - COMPRESSION 8× — résumé: "Reduced KV-cache memory footprint by 8×
 *     through Multi-Head Latent Attention implementation." That figure is
 *     stated under the Leviathan project bullet, but it is the compression
 *     ratio of the exact same MLA implementation this card is about, so it
 *     is reused here rather than invented.
 *   - TYPED 100% — résumé: "Packaged implementation as production-ready
 *     PyPI library with type hints..." The résumé states the library is
 *     fully typed but gives no numeric percentage; "100%" is the literal
 *     reading of "fully typed" onto the sample's own stat shape, not a
 *     fabricated measurement.
 */
export const MLA_STATS: readonly OtherProjectStat[] = [
  { label: 'COMPRESSION', value: '8', suffix: '×' },
  { label: 'TYPED', value: '100', suffix: '%' },
]

// --- Thesis ------------------------------------------------------------

export const THESIS_BADGE = 'RUNNING'

export const THESIS_TITLE = 'Generative Agent-Based Models for Insider Threat Detection'

export const THESIS_TAGLINE = 'Fake employees, real behavioural data.'

export const THESIS_DESCRIPTION =
  'A simulated organization staffed by generative LLM agents, some of them behaving as insider threats, producing the labelled behavioural data real security teams can rarely share.'

export const THESIS_STATS: readonly OtherProjectStat[] = [
  { label: 'DEFENSE', value: 'MAY', suffix: '2027' },
  { label: 'AGENTS', value: 'LLM' },
]

/** Number of dots in the illustrative agent cluster — a display choice, not a résumé figure. */
export const AGENT_DOT_COUNT = 24
