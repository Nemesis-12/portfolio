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
 *   - Email:    famohammed@shockers.wichita.edu (resume header, printed)
 *   - GitHub:   https://github.com/Nemesis-12 (resume header hyperlink)
 *   - LinkedIn: https://linkedin.com/in/fa-mohammed/ (resume header hyperlink)
 *
 * The resume link below points at `/resume.pdf`, the copy of this same PDF
 * tracked at `public/resume.pdf` and served from the site root -- the one
 * document that is the source of truth for every other fact on the page,
 * so it can never disagree with itself.
 *
 * `detail` is the row's left-hand text (rendered before `label` in
 * `Contact.tsx`). It is NOT the raw href target -- the sample
 * (`ideas/Portfolio.html` lines 567-570) never prints the email address (or
 * any other URL) in plain text on the page; each row leads with a short
 * descriptive phrase instead ("send me an email", "read the code", "the
 * professional one", "the long version") and only the right-hand tag names
 * the destination in the abstract ("MAIL", "GITHUB", "LINKEDIN", "RESUME").
 * The actual address/URL only ever appears in `href`, which is not visible
 * text (owner direction: the email must not be out in the open on the
 * page). The sample's own `href`s are placeholders, though, so those are
 * NOT copied -- `href` below stays the real mailto/GitHub/LinkedIn/resume
 * targets sourced above.
 *
 * `CONTACT_STATEMENT` is copy, not a resume fact. It stays consistent with
 * `HERO_ROLE` in `src/data/hero.ts` ("ASPIRING ML + SYSTEMS + SOFTWARE
 * ENGINEER") rather than narrowing to ML alone.
 */

export interface ContactLink {
  readonly id: string
  /**
   * Short right-hand tag rendered in caps next to the arrow (sample lines
   * 567-570 use "MAIL"/"GITHUB"/"LINKEDIN"/"RESUME") -- e.g. "Email".
   */
  readonly label: string
  /**
   * Left-hand descriptive text the row leads with, e.g. the address or a
   * short verb phrase -- the accessible name leads with this (mochi/
   * style-match: `Contact.tsx` renders `detail` before `label`, matching
   * the sample's own left-descriptive/right-tag row order).
   */
  readonly detail: string
  readonly href: string
  /** Opens in a new tab (external destinations); the resume PDF and mailto stay same-behaviour as the rest. */
  readonly external: boolean
}

export const CONTACT_STATEMENT =
  'Looking for ML, systems, or software engineering work — model internals, infrastructure, or anywhere the constraint is one GPU and a deadline.'

/**
 * Footer line under the contact links (sample line 574: "FARHAN MOHAMMED ·
 * 2026"). The name is the resume's own header ("Farhan Mohammed",
 * `public/resume.pdf`); the year is the current one, same as the sample's
 * own hardcoded "2026".
 */
export const CONTACT_FOOTER = 'FARHAN MOHAMMED · 2026'

export const CONTACT_LINKS: readonly ContactLink[] = [
  {
    id: 'email',
    label: 'Email',
    detail: 'send me an email',
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
    detail: 'the professional one',
    href: 'https://linkedin.com/in/fa-mohammed/',
    external: true,
  },
  {
    id: 'resume',
    label: 'Resume',
    detail: 'the long version',
    href: '/resume.pdf',
    external: true,
  },
]
