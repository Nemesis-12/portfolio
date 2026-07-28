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
 * IDs are validated against `src/data/sections.ts` at import time so this
 * list cannot silently drift from the section shell: if a section is
 * renamed or removed without updating this file, the app fails to import
 * instead of shipping a nav link that goes nowhere.
 */
const NAV_LABELS: ReadonlyArray<readonly [id: string, label: string]> = [
  ['projects', 'Projects'],
  ['skills', 'Skills'],
  ['path', 'Education & Experience'],
  ['contact', 'Contact'],
]

const sectionIds = new Set(sections.map((section) => section.id))

export const navItems: NavItem[] = NAV_LABELS.map(([id, label]) => {
  if (!sectionIds.has(id)) {
    throw new Error(
      `Nav target "${id}" does not match any section id in src/data/sections.ts -- ` +
        'update one or the other so the two cannot drift apart.',
    )
  }
  return { id, label }
})
