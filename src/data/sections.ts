/**
 * Canonical list of the six top-level sections, in page order.
 *
 * This is the single source of truth for section identity: `App` renders
 * exactly this list, in this order, and nav targets (#312) resolve against
 * these `id`s. Placeholder copy only -- real content lands in #317-#321.
 */
export interface SectionMeta {
  /** DOM id; also the scroll/nav target. */
  id: string
  /** Accessible name for the section landmark. */
  label: string
  /** Small eyebrow shown above the title, e.g. "02 · PROJECTS". */
  eyebrow: string
  /** Placeholder heading. */
  title: string
  /** Placeholder supporting line. */
  blurb: string
  /**
   * The chrome section number shown next to the title in `SectionHeading`
   * (`src/components/layout/SectionHeading.tsx`), e.g. "01" -- sample
   * lines 332-337, 417-422, 461-465, 492-496. Empty for sections that
   * don't use that heading row (`top`, `contact`).
   */
  number: string
  /**
   * The right-hand label in `SectionHeading`'s rule row, e.g. "FEATURED" --
   * sample lines 336, 421. `undefined` for sections whose sample markup
   * has no fourth span (`skills`, `path`) as well as those that don't use
   * the component at all (`top`, `contact`).
   */
  label2?: string
}

export const sections: SectionMeta[] = [
  {
    id: 'top',
    label: 'Hero',
    // The sample's hero (lines 294-328) has no eyebrow row of the
    // "NN · WORD" shape every other section uses above its heading --
    // `00 · HELLO` here was invented with no sample counterpart
    // (mochi/style-match audit). `Hero.tsx` doesn't read this field at
    // all (its own eyebrow line is `HERO_ROLE` from `src/data/hero.ts`),
    // but it's cleared so the data doesn't assert a row that was never
    // real.
    eyebrow: '',
    title: 'Farhan Mohammed',
    blurb: 'Placeholder hero copy — the Go board replay lands in #316.',
    number: '',
  },
  {
    id: 'projects',
    label: 'Projects — featured',
    eyebrow: '01 · PROJECTS',
    // Chrome heading text for `SectionHeading` (sample lines 332-337) --
    // distinct from `ProjectsFeatured.tsx`'s own hardcoded "Leviathan"
    // project-name heading, which this field is not consumed by.
    title: 'PROJECTS',
    blurb: 'Placeholder featured-project copy — full content lands in #317.',
    number: '01',
    label2: 'FEATURED',
  },
  {
    id: 'more',
    label: 'Projects — other',
    eyebrow: '',
    // Sample lines 417-422: the second projects screen repeats "01
    // PROJECTS" verbatim (same number as `projects`, not a new one).
    title: 'PROJECTS',
    blurb: 'Placeholder secondary-projects copy — full content lands in #318.',
    number: '01',
    label2: 'THE OTHER STUFF I WORKED ON',
  },
  {
    id: 'skills',
    label: 'Skills',
    eyebrow: '02 · SKILLS',
    title: 'SKILLS',
    blurb: 'Placeholder skills-graph copy — full content lands in #319.',
    number: '02',
    // No fourth span in the sample's Skills heading row (lines 461-465).
  },
  {
    id: 'path',
    // Renamed from "Education and experience"/"Education & experience"
    // (owner direction, #330): the nav destination is "Timeline", so the
    // section's accessible name (`label`) stays "Timeline" -- that field
    // is unread by any component today (aria-labelledby sources the
    // landmark name from the real heading via `headingId`, not from
    // this), so it doesn't need to track `eyebrow`/`title`.
    //
    // `eyebrow`/`title` themselves drifted from the sample to "03 ·
    // TIMELINE"/"Timeline" at some point; the sample (lines 493-494) says
    // "EDUCATION & EXPERIENCE" and `EducationExperience.tsx` renders
    // `meta.title` directly as its own `<h2>`, so both are restored to
    // match the sample verbatim (mochi/style-match audit).
    label: 'Timeline',
    eyebrow: '03 · EDUCATION & EXPERIENCE',
    title: 'EDUCATION & EXPERIENCE',
    // Real content (issue #320) lives in `src/data/timeline.ts` and is
    // rendered by `EducationExperience.tsx` directly, not through this
    // `blurb`/`SectionPlaceholder` -- this field is unused by that
    // section now, but is kept meaningful rather than left as
    // placeholder copy, since `SectionMeta` still requires it.
    blurb: 'Education and experience, side by side.',
    number: '03',
    // No fourth span in the sample's heading row (lines 492-496).
  },
  {
    id: 'contact',
    label: 'Contact',
    // Sample line 562: "04 · CONTACT · REPLIES WITHIN A DAY", not the
    // shorter "04 · CONTACT" this drifted to -- chrome text, taken
    // verbatim (mochi/style-match audit).
    eyebrow: '04 · CONTACT · REPLIES WITHIN A DAY',
    // Unread by `Contact.tsx` (mochi/style-match audit): the sample's
    // headline (line 563) is "LET'S BUILD / SOMETHING / SMALL AND FAST"
    // split across `<br>`s with the third line highlighted, which doesn't
    // fit this flat string field -- that chrome text is inlined directly
    // in the component instead. Kept here only because `SectionMeta`
    // still requires a `title`.
    title: 'Get in touch',
    blurb: 'What work is being sought, and direct links to reach out.',
    // Contact doesn't use `SectionHeading` (sample lines 560-564 differ
    // from the shared row) -- `number`/`label2` are unread here.
    number: '04',
  },
]

/**
 * Looks up a section's metadata by `id`, not by array position.
 *
 * Every section component used to do `sections[N]` -- e.g. `sections[4]`
 * for Timeline -- which silently renders the wrong eyebrow/title/blurb the
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
