import { sections } from './sections'

/** A single header nav destination. */
export interface NavItem {
  /** Section id to scroll to -- must match a real entry in `sections`. */
  id: string
  /** Visible link text. */
  label: string
}

/**
 * The four header nav destinations, in display order (#312).
 *
 * The hero (`top`) and the second projects screen (`more`) are
 * deliberately absent -- the spec reaches those by scrolling only, not
 * via the nav.
 *
 * Labels carry the reference design's numeric prefix (`ideas/Portfolio.html`,
 * decoded `<nav>` markup: `01 PROJECTS`, `02 SKILLS`, `03 ...`, `04
 * CONTACT`). The reference renders the numeral as plain text jammed
 * against the label inside the same anchor -- no separate span, no
 * dimming/sizing treatment -- so it is reproduced the same way here
 * rather than invented as a distinct decorative element. Because it's
 * plain text (not `aria-hidden`), it's part of the link's accessible
 * name too, matching what the reference actually ships.
 *
 * `path`'s destination is "Timeline" per owner direction (`Education &
 * Experience` was the working title from the reference; the project
 * owner has since renamed it). `src/data/sections.ts`'s `path` entry's
 * accessible `label` was updated to match, so the nav link and the
 * section landmark it points to agree on the destination's name.
 *
 * IDs are validated against `src/data/sections.ts` at import time. This
 * list must never drift from the section shell -- `nav.test.ts` asserts
 * the strict invariant that every declared target resolves to a real
 * section, so drift is caught in CI. At runtime, though, a mismatch
 * degrades to a dropped nav entry (logged via `console.error`) rather
 * than a thrown exception: every consumer of this module evaluates its
 * body, so throwing here would turn one dead nav link into a blank page
 * for the whole shipped bundle.
 */
const NAV_LABELS: ReadonlyArray<readonly [id: string, label: string]> = [
  ['projects', '01 Projects'],
  ['skills', '02 Skills'],
  ['path', '03 Timeline'],
  ['contact', '04 Contact'],
]

const sectionIds = new Set(sections.map((section) => section.id))

export const navItems: NavItem[] = NAV_LABELS.filter(([id]) => {
  if (!sectionIds.has(id)) {
    console.error(
      `Nav target "${id}" does not match any section id in src/data/sections.ts -- ` +
        'dropping it from the header nav. Update one or the other so the two cannot drift apart.',
    )
    return false
  }
  return true
}).map(([id, label]) => ({ id, label }))
