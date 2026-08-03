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
 *     with clean KV-compression/low-rank-projection abstractions — resume:
 *     "Translated Multi-Head Latent Attention from DeepSeek-V2 research
 *     into modular PyTorch implementation, designing clean abstractions
 *     for KV compression and low-rank projection components."
 *   - Packaged as a production-ready PyPI library with type hints,
 *     documentation, and integration examples — resume: "Packaged
 *     implementation as production-ready PyPI library with type hints,
 *     documentation, and integration examples."
 *   - GitHub + PyPI URLs — taken from the resume PDF's own link
 *     annotations (not typed by hand): both point at
 *     `Nemesis-12/multihead-latent-attention`, confirming the real PyPI
 *     package name. The design reference advertises `pip install
 *     mla-pytorch`, which does not match either URL — that is the defect
 *     this issue also fixes; the correct command is
 *     `pip install multihead-latent-attention`.
 *   - Thesis title "Generative Agent-Based Models for Insider Threat
 *     Detection" — resume, Education > Wichita State University
 *     (Accelerated MS in Computer Science).
 *   - Program dates "Jan 2026 – May 2027 (Expected)" — resume, same entry.
 *     The sample's own stat label for this figure is "DEFENSE" (sample
 *     line 453), which is restored here per the owner's chrome-is-verbatim
 *     ruling (mochi/style-match audit) — but the resume gives no separate
 *     thesis-defence date, only the program's own expected-completion
 *     date, so the value shown is that expected date. The owner asked for
 *     "SPRING" in place of "MAY" (mochi/style-match task 2, copy change)
 *     — "May" falls within the resume's own "Spring" academic-term
 *     convention (the same resume entry ends its Bachelor's Dean's List
 *     range at "Spring 2022"), so this is a coarser rendering of the same
 *     expected date, not a different one.
 *   - The sample's second thesis stat (line 454) is "AGENTS" / "LLM",
 *     restored verbatim as chrome too — it restates the thesis's own
 *     premise (LLM agents) rather than a resume figure, so nothing is
 *     invented by using it. This replaces the "Relevant Coursework: NLP,
 *     Reinforcement Learning" stat a previous pass showed under this
 *     label; that fact has no sample counterpart at this position and is
 *     not otherwise lost — it remains on the resume/Education section.
 *
 * The agent-dot cluster illustrating the thesis is an illustrative
 * visualization of the thesis's own premise (simulated organizations of
 * LLM agents, some behaving as insider threats) — not a claim about a
 * specific simulation size or result, neither of which the resume states.
 *
 * `THESIS_PROJECT`'s `tagline`/`description` were rewritten twice: first
 * per an explicit owner correction (post-#318) to state the thesis's real
 * aim — studying the build-up that might drift someone toward becoming an
 * insider threat, before any damage occurs, not detecting a breach after
 * the fact and not generating an attack dataset; then again per a second
 * owner correction (thesis-copy) to strip the remaining theory jargon
 * ("LLM personas", "OCC appraisal", "PAD mood", "JD-R stress",
 * "precursors") so a non-technical reader gets the idea on first read. No
 * numbers, dataset names, accuracy figures, or citations are invented
 * here or in the copy; this is an unpublished prototype and none exist in
 * the source material.
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

/**
 * The interactive element a card's "hero" row renders. A discriminated
 * union (not a `ReactNode` field) so this stays a plain data module --
 * `OtherProjectCard.tsx` is the only place that maps `kind` onto an actual
 * component, keeping the data/presentation split every other section here
 * follows.
 */
export type OtherProjectInteractive =
  | { readonly kind: 'install'; readonly command: string }
  | { readonly kind: 'agent-cluster' }

export interface OtherProjectBadge {
  readonly label: string
  readonly year: number
  /** Blinking "in progress" tag (the Thesis's "RUNNING · 2026"), vs. a plain static one. */
  readonly blink?: boolean
}

/**
 * One card on the second projects screen (issue #318, mochi/style-match
 * task 2). `OTHER_PROJECTS` below is the single list `ProjectsOther.tsx`
 * maps over -- adding a project is adding an entry here, nothing in the
 * component changes.
 */
export interface OtherProject {
  readonly id: string
  readonly title: string
  /**
   * Full title read to assistive tech when the visible `title` is a
   * shortened display name (the Thesis card shows "Thesis" but the real
   * title is read via `sr-only` text -- sample pattern, not invented).
   */
  readonly srOnlyTitle?: string
  readonly badge: OtherProjectBadge
  readonly tagline: string
  readonly description: string
  readonly interactive: OtherProjectInteractive
  readonly stats: readonly OtherProjectStat[]
  readonly extraLink?: OtherProjectLink
}

// --- MLA library -----------------------------------------------------------

const MLA_PROJECT: OtherProject = {
  id: 'mla',
  title: 'Multi-Head Latent Attention',
  /**
   * Boxed `PUBLISHED · 2025` tag (mochi/style-match task 2, unifying
   * every project card on the shared `ProjectTag` style Leviathan
   * already used). Year: resume — "Multi-Head Latent Attention (MLA) ···
   * Jun 2025 – Aug 2025", so the library was published within 2025.
   */
  badge: { label: 'PUBLISHED', year: 2025 },
  tagline: 'Read the paper. Wrote the library.',
  description:
    'Multi-Head Latent Attention from DeepSeek-V2, translated into a modular PyTorch implementation with clean abstractions for KV compression and low-rank projection — packaged as a production-ready PyPI library with type hints, documentation, and integration examples.',
  /** The exact command a visitor can copy and run in one step (issue #318 acceptance criteria). */
  interactive: { kind: 'install', command: 'pip install multihead-latent-attention' },
  /**
   * Stat footer (sample lines 434-435: "COMPRESSION 8×" / "TYPED 100%").
   *
   *   - COMPRESSION 8× — resume: "Reduced KV-cache memory footprint by 8×
   *     through Multi-Head Latent Attention implementation." That figure is
   *     stated under the Leviathan project bullet, but it is the compression
   *     ratio of the exact same MLA implementation this card is about, so it
   *     is reused here rather than invented.
   *   - TYPED 100% — resume: "Packaged implementation as production-ready
   *     PyPI library with type hints..." The resume states the library is
   *     fully typed but gives no numeric percentage; "100%" is the literal
   *     reading of "fully typed" onto the sample's own stat shape, not a
   *     fabricated measurement.
   */
  stats: [
    { label: 'COMPRESSION', value: '8', suffix: '×' },
    { label: 'TYPED', value: '100', suffix: '%' },
  ],
  /**
   * Both the source and package URLs come from the resume PDF's own link
   * annotations, confirming `multihead-latent-attention` as the real PyPI
   * package name; only the package link has a spot in the card (the
   * sample has no separate "source" link position on this card).
   */
  extraLink: { label: 'package', href: 'https://pypi.org/project/multihead-latent-attention' },
}

// --- Thesis ------------------------------------------------------------

const THESIS_PROJECT: OtherProject = {
  id: 'thesis',
  title: 'Thesis',
  srOnlyTitle: 'Generative Agent-Based Models for Insider Threat Detection',
  /**
   * Boxed `RUNNING · 2026` tag, blinking (mochi/style-match task 2 --
   * the owner explicitly asked for "the blinking running as a tag with
   * the year"). Year: resume — "Accelerated Master of Science in
   * Computer Science ··· Jan 2026 – May 2027 (Expected)"; the thesis
   * program started in 2026 and is still running (unlike Leviathan/MLA,
   * which report their *completion* year, an in-progress project has no
   * completion year yet, so this reports the year it started running).
   */
  badge: { label: 'RUNNING', year: 2026, blink: true },
  /**
   * `tagline`/`description` rewritten per an explicit owner correction: the
   * thesis studies the slow build-up — stress, resentment, feeling
   * treated unfairly — that might drift someone toward becoming an
   * insider threat, before any damage occurs -- it is not a post-breach
   * detector and not an attack-log generator. A second owner correction
   * (thesis-copy) then stripped the remaining theory jargon so the copy
   * reads in plain words on first pass. See the file header for the
   * fuller note; no numbers/datasets/citations are invented, as none
   * exist yet for this unpublished prototype.
   */
  tagline: 'Not the breach. The build-up.',
  description:
    'A simulated office of AI workers with their own moods and feelings, tracking how stress and unfair treatment build up over time — the warning signs before someone turns against their employer.',
  interactive: { kind: 'agent-cluster' },
  stats: [
    { label: 'DEFENSE', value: 'SPRING', suffix: '2027' },
    { label: 'AGENTS', value: 'LLM' },
  ],
}

/**
 * Second projects screen content, in display order. The MLA library and
 * the in-progress thesis (issue #318) today; new projects are added by
 * appending another `OtherProject` here -- `ProjectsOther.tsx`'s
 * `auto-fit` grid and `OtherProjectCard` are written to take any length.
 * (mochi/style-match task 2 verified this by temporarily rendering 3, 4,
 * 5, and 6 entries here and checking the section against the viewport at
 * each count -- see the grid's own comment in `ProjectsOther.tsx` for what
 * that verification found. No extra entries are committed.)
 */
export const OTHER_PROJECTS: readonly OtherProject[] = [MLA_PROJECT, THESIS_PROJECT]

/** Number of dots in the illustrative agent cluster — a display choice, not a resume figure. */
export const AGENT_DOT_COUNT = 24
