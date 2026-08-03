/**
 * Hero-specific content (issue #316). Kept separate from the placeholder
 * eyebrow/title/blurb in `src/data/sections.ts` -- that module is the
 * generic six-section shell's data (#311), while this is the real hero
 * copy and the Game 4 caption, per "content lives in data modules, not
 * inside render components."
 *
 * Facts (name) are traceable to `public/resume.pdf`. The tagline is copy,
 * not fact, and follows the design reference (`ideas/Portfolio.html`)
 * where the resume has no equivalent to contradict. The role line is the
 * project owner's explicit wording choice and deliberately departs from
 * the reference -- it is not meant to track it.
 */

export const HERO_NAME_FIRST = 'FARHAN'
export const HERO_NAME_LAST = 'MOHAMMED'
export const HERO_ROLE = 'ASPIRING ML + SYSTEMS + SOFTWARE ENGINEER'
export const HERO_TAGLINE = 'I build things that are fun.'

/**
 * Hero stat-strip tiles (sample lines 307-311, mochi/style-match). The
 * sample's own tile text ("SWE Intern · NetApp", "MS Computer Science") is
 * itself resume-shaped content, not decorative chrome, so it is restated
 * here from `public/resume.pdf` rather than copied from the sample
 * verbatim: resume lists the current NetApp role as "Software Engineer
 * Intern" (Jun 2026 - Present) and the degree as "Accelerated Master of
 * Science in Computer Science" (Wichita State, Jan 2026 - May 2027
 * expected). Both values below abbreviate those same facts the same way
 * the sample's tiles do (SWE / MS) without changing what they say. Labels
 * ("CURRENTLY", "STUDYING") and the CTA text ("GET IN TOUCH") are chrome
 * -- taken verbatim.
 */
export const HERO_STAT_CURRENT_LABEL = 'CURRENTLY'
export const HERO_STAT_CURRENT_VALUE = 'SWE Intern · NetApp'
export const HERO_STAT_STUDY_LABEL = 'STUDYING'
export const HERO_STAT_STUDY_VALUE = 'MS Computer Science'
export const HERO_CTA_LABEL = 'GET IN TOUCH'

/** Caption labels shown alongside the board -- must stay true of what plays. */
export const GAME4_WHITE_LABEL = 'LEE SEDOL · WHITE'
export const GAME4_BLACK_LABEL = 'ALPHAGO · BLACK'
export const GAME4_CAPTION = 'GAME 4 · 2016 · WHITE WINS BY RESIGNATION'
