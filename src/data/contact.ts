/**
 * Contact content: closing statement and the labelled links, issue #321.
 * Copy and link targets live here; `Contact.tsx` is pure presentation over
 * this module, matching the pattern established by `src/data/leviathan.ts`.
 *
 * The email address, GitHub destination, and LinkedIn destination are all
 * sourced from `public/resume.pdf`. The PDF's visible header text names
 * "Portfolio · LinkedIn · GitHub" without printing their URLs, but the
 * header text is itself hyperlinked -- the underlying link targets were
 * read from the PDF's link annotations (via `pdftohtml`), not guessed:
 *
 *   - Email:    famohammed@shockers.wichita.edu (résumé header, printed)
 *   - GitHub:   https://github.com/Nemesis-12 (résumé header hyperlink)
 *   - LinkedIn: https://linkedin.com/in/fa-mohammed/ (résumé header hyperlink)
 *
 * The résumé link below points at `/resume.pdf`, the copy of this same PDF
 * tracked at `public/resume.pdf` and served from the site root -- the one
 * document that is the source of truth for every other fact on the page,
 * so it can never disagree with itself.
 *
 * `CONTACT_STATEMENT` is copy, not a résumé fact. It stays consistent with
 * `HERO_ROLE` in `src/data/hero.ts` ("ASPIRING ML + SYSTEMS + SOFTWARE
 * ENGINEER") rather than narrowing to ML alone.
 */

export interface ContactLink {
  readonly id: string
  /** What the link actually is, e.g. "Email" -- the accessible name leads with this. */
  readonly label: string
  /** Supporting detail shown alongside the label, e.g. the address or a short verb phrase. */
  readonly detail: string
  readonly href: string
  /** Opens in a new tab (external destinations); the résumé PDF and mailto stay same-behaviour as the rest. */
  readonly external: boolean
}

export const CONTACT_STATEMENT =
  'Looking for ML, systems, or software engineering work — model internals, infrastructure, or anywhere the constraint is one GPU and a deadline.'

export const CONTACT_LINKS: readonly ContactLink[] = [
  {
    id: 'email',
    label: 'Email',
    detail: 'famohammed@shockers.wichita.edu',
    href: 'mailto:famohammed@shockers.wichita.edu',
    external: false,
  },
  {
    id: 'github',
    label: 'GitHub',
    detail: 'read the code',
    href: 'https://github.com/Nemesis-12',
    external: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    detail: 'the professional profile',
    href: 'https://linkedin.com/in/fa-mohammed/',
    external: true,
  },
  {
    id: 'resume',
    label: 'Résumé',
    detail: 'the full write-up, as a PDF',
    href: '/resume.pdf',
    external: true,
  },
]
