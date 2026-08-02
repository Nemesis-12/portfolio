/**
 * Timeline content: education and experience, side by side (issue #320).
 *
 * Every date, title, GPA, and honour below is sourced verbatim from
 * `public/resume.pdf`. Where the design reference (`ideas/Portfolio.html`,
 * gitignored, local-only) disagreed with or embellished the résumé, the
 * résumé wins:
 *
 *   - Degree titles use the résumé's exact wording ("Accelerated Master of
 *     Science in Computer Science", "Bachelor of Science in Computer
 *     Science") rather than the reference's abbreviated "MS/BS COMPUTER
 *     SCIENCE".
 *   - GPA and honour: résumé — "GPA: 3.66/4.0, Magna Cum Laude".
 *   - Dean's List range: résumé — "Dean's List: Spring 2022 – Fall 2025".
 *   - Thesis title: résumé — "Thesis: Generative Agent-Based Models for
 *     Insider Threat Detection" (the reference lower-cased and shortened
 *     this).
 *   - Coursework lists reproduce the résumé's own course names rather than
 *     the reference's paraphrase ("Machine learning, AI, agents, data
 *     science").
 *   - The NetApp "Software Engineer Intern" role has exactly ONE bullet on
 *     the résumé; it is split into two here (endpoints/refactors vs. code
 *     review) rather than inventing a second fact the way the reference
 *     did ("Enough PR reviews to have opinions about naming" appears
 *     nowhere on the résumé and is deliberately not reproduced).
 *   - The "Software Engineer in Test" role's four résumé bullets are
 *     trimmed to the three most substantive, quantified ones (30% manual
 *     -config reduction, 300+ system configurations, 1M+ database
 *     entries) to fit the ticket's two-or-three-bullet limit; the
 *     dropped telemetry-pipeline bullet is the only one without a
 *     headline figure.
 *   - Date ranges reuse the résumé's own formatting exactly, including
 *     the en dash and "(Expected)"/"Present" qualifiers.
 *
 * The two résumé roles at NetApp Inc. — "Software Engineer Intern" (Jun
 * 2026 – Present) and "Software Engineer in Test" (Jul 2024 – Jun 2026) —
 * are represented as two distinct entries with their own date ranges, not
 * flattened into one.
 */

export type TimelineStatus = 'current' | 'complete'

export interface TimelineEntry {
  readonly id: string
  readonly status: TimelineStatus
  /** Short status word shown next to the status indicator, e.g. "Studying now". */
  readonly statusLabel: string
  /** Résumé date range, reproduced verbatim. */
  readonly dateRange: string
  /** Résumé title, reproduced verbatim. */
  readonly title: string
  /** Short qualifier line -- GPA/honour, or a one-line role qualifier. */
  readonly qualifier: string
  /** Two or three supporting bullets, each sourced from the résumé. */
  readonly bullets: readonly string[]
}

export interface TimelineColumn {
  readonly id: string
  /** Column heading, e.g. "Wichita State University". */
  readonly heading: string
  /** Column kind label shown alongside the heading. */
  readonly kind: string
  readonly entries: readonly TimelineEntry[]
}

export const EDUCATION_COLUMN: TimelineColumn = {
  id: 'education',
  heading: 'Wichita State University',
  kind: 'Education',
  entries: [
    {
      id: 'ms-cs',
      status: 'current',
      statusLabel: 'Studying now',
      dateRange: 'Jan 2026 – May 2027 (Expected)',
      title: 'Accelerated Master of Science in Computer Science',
      qualifier: 'Thesis track',
      bullets: [
        'Thesis: Generative Agent-Based Models for Insider Threat Detection',
        'Relevant coursework: NLP, Reinforcement Learning',
      ],
    },
    {
      id: 'bs-cs',
      status: 'complete',
      statusLabel: 'Graduated',
      dateRange: 'Jan 2022 – Dec 2025',
      title: 'Bachelor of Science in Computer Science',
      qualifier: 'GPA 3.66/4.0 · Magna Cum Laude',
      bullets: [
        "Dean's List: Spring 2022 – Fall 2025",
        'Relevant coursework: Machine Learning, Artificial Intelligence, Fundamentals of AI Agents, Data Science',
      ],
    },
  ],
}

export const EXPERIENCE_COLUMN: TimelineColumn = {
  id: 'experience',
  heading: 'NetApp Inc.',
  kind: 'Experience',
  entries: [
    {
      id: 'swe-intern',
      status: 'current',
      statusLabel: 'Working now',
      dateRange: 'Jun 2026 – Present',
      title: 'Software Engineer Intern',
      qualifier: 'Wichita, KS',
      bullets: [
        'API endpoints in TypeScript and PostgreSQL for the web platform',
        'Code refactors and pull request reviews across the existing codebase',
      ],
    },
    {
      id: 'swe-test',
      status: 'complete',
      statusLabel: 'Previous role',
      dateRange: 'Jul 2024 – Jun 2026',
      title: 'Software Engineer in Test',
      qualifier: 'Wichita, KS',
      bullets: [
        'Python automation framework reducing manual configuration tasks by 30% across Linux, Windows, and VMware',
        'Ansible-based deployment orchestration for 300+ system configurations',
        'Interactive visualization dashboard analyzing 1M+ database entries for engineering insights',
      ],
    },
  ],
}

export const TIMELINE_COLUMNS: readonly TimelineColumn[] = [EDUCATION_COLUMN, EXPERIENCE_COLUMN]
