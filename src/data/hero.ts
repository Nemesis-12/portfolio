/**
 * Hero-specific content (issue #316). Kept separate from the placeholder
 * eyebrow/title/blurb in `src/data/sections.ts` -- that module is the
 * generic six-section shell's data (#311), while this is the real hero
 * copy and the Game 4 caption, per "content lives in data modules, not
 * inside render components."
 *
 * Facts (name) are traceable to `public/resume.pdf`. The tagline is copy,
 * not fact, and follows the design reference (`ideas/Portfolio.html`)
 * where the résumé has no equivalent to contradict. The role line is the
 * project owner's explicit wording choice and deliberately departs from
 * the reference -- it is not meant to track it.
 */

export const HERO_NAME_FIRST = 'FARHAN'
export const HERO_NAME_LAST = 'MOHAMMED'
export const HERO_ROLE = 'ASPIRING ML + SYSTEMS + SOFTWARE ENGINEER'
export const HERO_TAGLINE = 'I build things that are fun.'

/** Caption labels shown alongside the board -- must stay true of what plays. */
export const GAME4_WHITE_LABEL = 'LEE SEDOL · WHITE'
export const GAME4_BLACK_LABEL = 'ALPHAGO · BLACK'
export const GAME4_CAPTION = 'GAME 4 · 2016 · WHITE WINS BY RESIGNATION'
