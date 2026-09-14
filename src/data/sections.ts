/**
 * Canonical list of the five top-level sections, in page order.
 *
 * This is the single source of truth for section identity: `App` renders
 * exactly this list, in this order, and nav targets (#312) resolve against
 * these `id`s.
 */
export interface SectionMeta {
  /** DOM id; also the scroll/nav target. */
  id: string
  /** Section heading text. For `top` and `contact`, kept for reference even though neither component renders it as its own `<h2>` text. */
  title: string
  /**
   * Small chrome line shown above the headline, e.g.
   * "04 · CONTACT · REPLIES WITHIN A DAY". Only `contact` renders this
   * (`Contact.tsx`); every other section is omitted rather than carrying
   * an unused value.
   */
  eyebrow?: string
  /**
   * The chrome section number shown next to the title in `SectionHeading`
   * (`src/components/layout/SectionHeading.tsx`) and in the header nav
   * (`src/data/nav.ts`), e.g. "01". Omitted for `top`, the only section
   * that uses neither.
   */
  number?: string
  /**
   * The right-hand label in `SectionHeading`'s rule row, e.g. "FEATURED".
   * Only `projects` uses it (`ProjectsFeatured.tsx`); every other section
   * is omitted.
   */
  headingLabel?: string
}

export const sections: SectionMeta[] = [
  {
    id: 'top',
    title: 'Farhan Mohammed',
  },
  {
    id: 'projects',
    eyebrow: '01 · PROJECTS',
    // Chrome heading text for `SectionHeading` (sample lines 332-337) --
    // distinct from `ProjectsFeatured.tsx`'s own hardcoded "Leviathan"
    // project-name heading, which this field is not consumed by.
    title: 'PROJECTS',
    number: '01',
    headingLabel: 'FEATURED',
  },
  {
    id: 'skills',
    eyebrow: '02 · SKILLS',
    title: 'SKILLS',
    number: '02',
    // No fourth span in the sample's Skills heading row (lines 461-465).
  },
  {
    id: 'path',
    // Renamed from "Education and experience"/"Education & experience" to
    // "Timeline" (owner direction, #330). The design reference's sample
    // (lines 493-494) still says "EDUCATION & EXPERIENCE", but the owner's
    // rename overrides the reference for this section -- do not restore
    // the reference's wording here again. `EducationExperience.tsx`
    // renders `meta.title` directly as its own `<h2>`.
    eyebrow: '03 · TIMELINE',
    title: 'TIMELINE',
    number: '03',
    // No fourth span in the sample's heading row (lines 492-496).
  },
  {
    id: 'contact',
    // Sample line 562: "04 · CONTACT · REPLIES WITHIN A DAY", not the
    // shorter "04 · CONTACT" this drifted to -- chrome text, taken
    // verbatim (mochi/style-match audit).
    eyebrow: '04 · CONTACT · REPLIES WITHIN A DAY',
    // Unread by `Contact.tsx` (mochi/style-match audit): the sample's
    // headline (line 563) is "LET'S BUILD / SOMETHING / SMALL AND FAST"
    // split across `<br>`s with the third line highlighted, which doesn't
    // fit this flat string field -- that chrome text is inlined directly
    // in the component instead. Kept here for reference only.
    title: 'Get in touch',
    // Contact doesn't use `SectionHeading` (sample lines 560-564 differ
    // from the shared row) -- `number` is unread here, but nav.ts still
    // reads it for the header nav link ("04 CONTACT").
    number: '04',
  },
]

/**
 * Looks up a section's metadata by `id`, not by array position.
 *
 * Every section component used to do `sections[N]` -- e.g. `sections[4]`
 * for Timeline -- which silently renders the wrong eyebrow/title the
 * moment this array is reordered, with no error anywhere. `getSectionMeta`
 * replaces that: it fails loudly (throws) if `id` doesn't match an entry,
 * instead of failing silently by rendering the wrong section's copy.
 */
export function getSectionMeta(id: string): SectionMeta {
  const meta = sections.find((section) => section.id === id)
  if (!meta) {
    throw new Error(`No section in src/data/sections.ts has id "${id}".`)
  }
  return meta
}
