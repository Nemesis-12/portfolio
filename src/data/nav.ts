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
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['path', 'Education & Experience'],
  ['contact', 'Contact'],
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
