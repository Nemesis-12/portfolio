import { getSectionMeta, sections } from './sections'

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
 * Labels are `"{number} {chrome text}"`, matching the reference design's
 * `<nav>` markup verbatim (`ideas/Portfolio.html` lines 270-273) for three
 * of the four: `01 PROJECTS`, `02 SKILLS`, `04 CONTACT`. The third renders
 * `03 TIMELINE`, not the reference's `03 EDUCATION & EXPERIENCE` -- the
 * owner renamed that section to "Timeline" (#330), and that rename
 * overrides the reference here. The reference renders the numeral as
 * plain text jammed against the label inside the same anchor -- no
 * separate span, no dimming/sizing treatment -- so it is reproduced the
 * same way here rather than invented as a distinct decorative element.
 * Because it's plain text (not `aria-hidden`), it's part of the link's
 * accessible name too.
 *
 * `number` and (for three of the four ids) the label text itself are
 * derived from `getSectionMeta(id)` rather than restated as string
 * literals here, so the nav and the section chrome it points at can't
 * drift apart independently. `contact` needs `NAV_TEXT_OVERRIDE`: that
 * section's `title` field (`src/data/sections.ts`) is resume-facing body
 * content ("Get in touch"), not the sample's "CONTACT" nav chrome --
 * `Contact.tsx` doesn't even read `title` for its own headline, so there
 * is no section-chrome field to borrow from for that one id.
 */
const NAV_IDS = ['projects', 'skills', 'path', 'contact'] as const

const NAV_TEXT_OVERRIDE: Partial<Record<string, string>> = {
  contact: 'CONTACT',
}

const sectionIds = new Set(sections.map((section) => section.id))

export const navItems: NavItem[] = NAV_IDS.flatMap((id) => {
  if (!sectionIds.has(id)) {
    console.error(
      `Nav target "${id}" does not match any section id in src/data/sections.ts -- ` +
        'dropping it from the header nav. Update one or the other so the two cannot drift apart.',
    )
    return []
  }
  const meta = getSectionMeta(id)
  const text = NAV_TEXT_OVERRIDE[id] ?? meta.title
  return [{ id, label: `${meta.number} ${text}` }]
})
