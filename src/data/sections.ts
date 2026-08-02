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
}

export const sections: SectionMeta[] = [
  {
    id: 'top',
    label: 'Hero',
    eyebrow: '00 · HELLO',
    title: 'Farhan Mohammed',
    blurb: 'Placeholder hero copy — the Go board replay lands in #316.',
  },
  {
    id: 'projects',
    label: 'Projects — featured',
    eyebrow: '01 · PROJECTS',
    title: 'Leviathan',
    blurb: 'Placeholder featured-project copy — full content lands in #317.',
  },
  {
    id: 'more',
    label: 'Projects — other',
    eyebrow: '',
    title: 'Other work',
    blurb: 'Placeholder secondary-projects copy — full content lands in #318.',
  },
  {
    id: 'skills',
    label: 'Skills',
    eyebrow: '02 · SKILLS',
    title: 'Skills',
    blurb: 'Placeholder skills-graph copy — full content lands in #319.',
  },
  {
    id: 'path',
    // Renamed from "Education and experience"/"Education & experience"
    // (owner direction, #330): the nav destination is "Timeline", so the
    // section's accessible name (`label`), visible heading (`title`), and
    // eyebrow all agree with it -- eyebrow follows the same
    // "NN · <primary word, uppercased>" convention every other section
    // uses (PROJECTS, SKILLS, CONTACT each echo their own `label`/`title`
    // word, not the old id), so it becomes TIMELINE rather than PATH.
    // `id` stays 'path' -- other branches and every scroll/nav target
    // depend on it. `blurb` was placeholder copy owned by #320; it is
    // now updated below and no longer consumed by this section's real
    // content (`src/components/sections/EducationExperience.tsx`).
    label: 'Timeline',
    eyebrow: '03 · TIMELINE',
    title: 'Timeline',
    // Real content (issue #320) lives in `src/data/timeline.ts` and is
    // rendered by `EducationExperience.tsx` directly, not through this
    // `blurb`/`SectionPlaceholder` -- this field is unused by that
    // section now, but is kept meaningful rather than left as
    // placeholder copy, since `SectionMeta` still requires it.
    blurb: 'Education and experience, side by side.',
  },
  {
    id: 'contact',
    label: 'Contact',
    eyebrow: '04 · CONTACT',
    title: 'Get in touch',
    blurb: 'What work is being sought, and direct links to reach out.',
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
