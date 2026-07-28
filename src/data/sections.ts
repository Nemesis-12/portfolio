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
    blurb: 'Placeholder hero copy -- the Go board replay lands in #316.',
  },
  {
    id: 'projects',
    label: 'Projects — featured',
    eyebrow: '01 · PROJECTS',
    title: 'Leviathan',
    blurb: 'Placeholder featured-project copy -- full content lands in #317.',
  },
  {
    id: 'more',
    label: 'Projects — other',
    eyebrow: '',
    title: 'Other work',
    blurb: 'Placeholder secondary-projects copy -- full content lands in #318.',
  },
  {
    id: 'skills',
    label: 'Skills',
    eyebrow: '02 · SKILLS',
    title: 'Skills',
    blurb: 'Placeholder skills-graph copy -- full content lands in #319.',
  },
  {
    id: 'path',
    // Renamed from "Education and experience" (owner direction, #330):
    // the nav destination is now "Timeline", so the section landmark's
    // accessible name matches what the nav link that points here says.
    // `id`/`eyebrow`/`title`/`blurb` are unchanged -- other branches and
    // scroll/nav targets depend on `id`, and `title`/`blurb` are
    // placeholder copy owned elsewhere.
    label: 'Timeline',
    eyebrow: '03 · PATH',
    title: 'Education & experience',
    blurb: 'Placeholder timeline copy -- full content lands in #320.',
  },
  {
    id: 'contact',
    label: 'Contact',
    eyebrow: '04 · CONTACT',
    title: 'Get in touch',
    blurb: 'Placeholder contact copy -- full content lands in #321.',
  },
]
