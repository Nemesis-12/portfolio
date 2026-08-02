/**
 * Second projects screen content: the MLA library and the in-progress
 * thesis (issue #318). This screen follows the featured Leviathan screen
 * (#317) and deliberately reads as its continuation, not a repeat of it —
 * see `sections[2].eyebrow` in `src/data/sections.ts`, which is the empty
 * string on purpose (the design reference reused "01 · PROJECTS" on both
 * project screens; that duplicate number is the defect this issue fixes).
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
 *     The résumé gives no separate thesis-defence date, only the
 *     program's own expected-completion date, so that expected date is
 *     what the "defence date" stat below shows — labelled "EXPECTED" to
 *     stay literally true to the résumé's own qualifier rather than
 *     implying a defence has been scheduled.
 *   - Relevant coursework "NLP, Reinforcement Learning" — résumé, same
 *     entry.
 *
 * The agent-dot cluster illustrating the thesis is an illustrative
 * visualization of the thesis's own premise (simulated organizations of
 * LLM agents, some behaving as insider threats) — not a claim about a
 * specific simulation size or result, neither of which the résumé states.
 */

export interface OtherProjectStat {
  readonly label: string
  readonly value: string
}

export interface OtherProjectLink {
  readonly label: string
  readonly href: string
}

/** Shown next to the section heading, mirroring how the featured screen pairs its h2 with `LEVIATHAN_SUBTITLE`. */
export const OTHER_PROJECTS_SUBTITLE = 'mla library · thesis in progress'

export const OTHER_PROJECTS_TITLE = 'Beyond Leviathan'

export const OTHER_PROJECTS_LEAD =
  'The other half of the ledger: a published research library, and the thesis it grew out of.'

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

// --- Thesis ------------------------------------------------------------

export const THESIS_BADGE = 'RUNNING'

export const THESIS_TITLE = 'Generative Agent-Based Models for Insider Threat Detection'

export const THESIS_TAGLINE = 'Fake employees, real behavioural data.'

export const THESIS_DESCRIPTION =
  'A simulated organization staffed by generative LLM agents, some of them behaving as insider threats, producing the labelled behavioural data real security teams can rarely share.'

export const THESIS_STATS: readonly OtherProjectStat[] = [
  { label: 'EXPECTED', value: 'MAY 2027' },
  { label: 'COURSEWORK', value: 'NLP · RL' },
]

/** Number of dots in the illustrative agent cluster — a display choice, not a résumé figure. */
export const AGENT_DOT_COUNT = 24
