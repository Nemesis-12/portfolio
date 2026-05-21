# Portfolio v4 — PRD

## Problem Statement

The production portfolio app does not visually match its canonical reference design (`ideas/Portfolio.html` and the six reference screenshots in `ideas/`). The gap is not a missing spec — the design intent is well-understood. The gap is architectural: every time an agent rewrites a component, it translates the reference's precise vanilla CSS (`clamp()`, `vw` units, exact `px` values, exact `letter-spacing`) into Tailwind v4 utility classes. This translation is lossy.

Concrete examples of the drift:

| Reference CSS value | What agents produce | Visual damage |
|---|---|---|
| `font-size: clamp(40px, 12vw, 180px)` | `text-5xl` (48px fixed) | Hero name is 3–4× too small |
| `padding: 0 5vw` | `px-8` (32px fixed) | Layout loses viewport-relative spacing |
| `font-size: clamp(40px, 8vw, 120px)` | `text-3xl md:text-5xl` | Contact CTA is massively undersized |
| `letter-spacing: 5px` | `tracking-widest` | Spacing is imprecise |
| `border-radius: 0` on scrollbar | `border-radius: 4px` | Browser chrome has wrong feel |
| `clip-path` notch card | `rounded` with `bg-platinum` | Cards look like generic portfolio tiles |
| `grid-template-areas` bento | ad-hoc grid utilities | Skills bento loses size hierarchy |

The result is that the site looks like a generic portfolio with the correct color scheme rather than the distinctive full-screen terminal artifact the reference describes.

## Solution

The solution has three parts:

**Part 1 — CSS anchor.** Create `src/portfolio.css` as a near-verbatim copy of the `<style>` block from `ideas/Portfolio.html` (lines 11–233), restructured as `@layer components { … }`. Color tokens already exist in `src/index.css`; only the component rules need to be ported. This gives every component a stable set of class names whose values are proven correct by the reference. Agents no longer derive CSS values — they apply class names.

**Part 2 — Component fixes.** Update each component to use the ported class names instead of Tailwind approximations for all layout-critical and typography-critical properties.

**Part 3 — Cursor rule.** Create `.cursor/rules/portfolio-css.md` instructing agents never to replace classes from `src/portfolio.css` with Tailwind equivalents.

## User Stories

### Loading Screen
1. As a visitor, I want the loading screen to be full-screen graphite so that the boot sequence feels immersive and intentional.
2. As a visitor, I want to see a pixel-font `FARHAN / MOHAMMED` identity during boot so that the brand is established before the hero loads.
3. As a visitor, I want a thin orange progress bar that fills over roughly 2.6–3.0s so that the load pacing feels deliberate.
4. As a visitor, I want rotating terminal status messages (`LOADING_ASSETS`, `COMPILING_MODULES`, etc.) so that the boot sequence reads as a real system init.
5. As a visitor, I want the loading screen to fade smoothly into the hero so that there is no visual jump.

### Navbar
6. As a visitor, I want a fixed full-width navbar with translucent graphite background and backdrop blur so that it feels like a floating terminal bar.
7. As a visitor, I want the logo `FM_` in pixel font on the left so that the brand mark is consistent.
8. As a visitor, I want nav links in uppercase Space Mono with letter-spacing so that they read as terminal labels.
9. As a visitor, I want the active nav link to show orange text and an orange underline scoped only to the label (not the caret) so that the active state is precise.
10. As a visitor, I want the `>` caret to appear on hover only (not on active) so that hover and active feel distinct.
11. As a visitor, I want the navbar to sit above all card-deck stack layers so that it is always accessible.

### Hero
12. As a visitor, I want the hero section to be full-viewport and full-width so that the name dominates the screen without centering constraints.
13. As a visitor, I want `// PORTFOLIO_INIT` to type in character-by-character before the name starts so that the sequence feels like a system initializing.
14. As a visitor, I want a short orange bar below `// PORTFOLIO_INIT` whose left edge is aligned with the `//` start so that the bar reads as an underline for that label specifically.
15. As a visitor, I want the hero name (`FARHAN` / `MOHAMMED`) to be two separate stacked lines in Press Start 2P at `clamp(40px, 12vw, 180px)` so that the name dominates the viewport at any screen width.
16. As a visitor, I want the name to type in line-by-line (FARHAN completes, then MOHAMMED starts) so that the sequence has rhythm.
17. As a visitor, I want a blinking orange cursor at the end of MOHAMMED after it finishes typing so that it signals the terminal is waiting.
18. As a visitor, I want the rotating role line (e.g. `BUILDER`) in periwinkle Space Mono at `clamp(11px, 1.1vw, 15px)` with `letter-spacing: 5px` so that it reads as a status label beneath the name.
19. As a visitor, I want the value-prop line `// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.` in Space Mono below the role so that the one-line descriptor is readable and on-brand.
20. As a visitor, I want the CTA buttons to appear after the value-prop types in, using rectangular sharp-edged buttons (no border-radius) so that they match the reference exactly.
21. As a visitor, I want the fill CTA (`VIEW_WORK`) to be orange with graphite text, and the outline CTA (`VIEW_RESUME`) to be a platinum-bordered ghost button so that the hierarchy between actions is clear.
22. As a visitor, I want the hero background to be a subtle line grid (not a dot grid) with a radial mask fade from the left so that the grid enhances depth without being decorative.
23. As a visitor, I want hero content to use `padding: 0 5vw` so that the layout breathes at all viewport widths.

### Projects Carousel
24. As a visitor, I want the Projects section to occupy `(projectCount * 1.5 + 1) * 100vh` of scroll height so that scrolling through six projects feels paced rather than rushed.
25. As a visitor, I want the first and last 20–25vh of the Projects scroll range to be dead zones where the carousel does not move so that entering and exiting the section is comfortable.
26. As a visitor, I want the active project card to be horizontally centered in the viewport at all times so that focus is always clear.
27. As a visitor, I want immediate neighbor cards to be partially visible at reduced scale and opacity so that the carousel communicates there are more cards.
28. As a visitor, I want far cards to be visually suppressed so that attention stays on the active card.
29. As a visitor, I want each project card to be a large notched/clipped rectangle (`clip-path` polygon corners, not rounded) in platinum so that the cards feel physically distinct from the background.
30. As a visitor, I want a large low-opacity ghost number (`_01`, `_02`, etc.) behind the card content so that the card has depth and identity.
31. As a visitor, I want project titles to use Press Start 2P (`clamp(20px, 2vw, 26px)`) so that the name has display weight.
32. As a visitor, I want tags to be sharp rectangular blocks using the palette colors (yellow, fuchsia, blue, orange-outline) with no border-radius so that they match the reference tile system.
33. As a visitor, I want project links to use `// LABEL ↗` terminal language so that the link style is consistent with the rest of the site.
34. As a visitor, I want a hover fill that moves diagonally from the top-left notch corner toward the bottom-right so that the fill feels physical and directional.
35. As a visitor, I want card content (title, tags, links, ghost number) to remain readable and transition to platinum-on-graphite during the hover fill so that the card is usable in both states.
36. As a visitor, I want a section header row showing `// 01  PROJECTS` (orange `//`, orange number, pixel font section name) so that the section is labeled in the reference style.
37. As a visitor, I want a progress counter in the header (`02 / 06`) and a thin orange progress bar so that I know where I am in the carousel.
38. As a visitor, I want a `SCROLL →` hint at the bottom that fades once the carousel starts moving so that the scroll interaction is discoverable.
39. As a visitor, I want edge spacers before the first and after the last card so that the first and last cards can reach the centered position.

### Skills
40. As a visitor, I want the skills section to use the exact six-column `grid-template-areas` bento layout from the reference so that Python dominates the top-left and tile sizes communicate skill importance.
41. As a visitor, I want sharp rectangular bento tiles (no rounded corners) with strong palette blocks so that the grid feels like a physical mosaic.
42. As a visitor, I want the palette swatch tile (four color swatches) in the bottom-right so that the design system is self-referential.
43. As a visitor, I want tiles to reveal in deterministic largest-first order on section entry so that the cascade always feels intentional.
44. As a visitor, I want the reveal to reset and replay when the section re-enters the viewport so that repeat visitors see the animation again.
45. As a visitor, I want category labels in small uppercase mono and skill names in bold mono so that each tile has a consistent two-line hierarchy.
46. As a visitor, I want the section header `// 02  SKILLS` in the reference style above the grid so that it is labeled consistently with Projects.

### Timeline
47. As a visitor, I want each timeline entry to be a full-screen sticky panel so that one entry occupies the entire viewport at a time.
48. As a visitor, I want entries in newest-first order so that the most recent work is encountered first.
49. As a visitor, I want the section-type label (`// EDUCATION` or `// EXPERIENCE`) to appear at the top of each panel, with `//` in Space Mono and the section word in Press Start 2P, both in orange, so that the kind of entry is immediately clear.
50. As a visitor, I want the `//` to be visually smaller than the section word so that the hierarchy within the label is preserved.
51. As a visitor, I want the commit metadata (`commit <hash>`, `Author`, `Date`) to type in first in orange/periwinkle mono so that the git-log framing is established before the main content.
52. As a visitor, I want the institution/company name to type in as large Press Start 2P text (`clamp(28px, 4vw, 52px)`) so that it dominates the panel the way the hero name dominates the hero.
53. As a visitor, I want the role/title to appear in uppercase Space Mono below the institution name so that the content hierarchy goes: label → commit meta → institution → role → bullets.
54. As a visitor, I want each bullet to type in sequentially with a small delay between bullets so that the panel feels like a log being printed.
55. As a visitor, I want a panel's typed content to remain visible when it deactivates (user scrolls past it) so that it does not blank during stack transitions.
56. As a visitor, I want a section header row `// 03  TIMELINE` with a progress counter (`01 / 05`) so that the entry position is always visible.
57. As a visitor, I want a `SCROLL ↓` hint at the bottom of each timeline panel so that the scroll direction is always clear.

### Contact / CTA
58. As a visitor, I want the contact section to be full-screen with `LET'S` on one line and `CONNECT.` on the next in Press Start 2P at `clamp(40px, 8vw, 120px)` so that the CTA dominates the viewport the same way the hero name does.
59. As a visitor, I want the text to be centered (unlike the left-aligned hero) so that the CTA feels like a declaration.
60. As a visitor, I want the period `.` to be orange and followed by a blinking orange block cursor so that the terminal punctuation lands as a visual beat.
61. As a visitor, I want `SEND_MESSAGE →` as a centered orange fill button below the heading so that the primary action is unmissable.
62. As a visitor, I want social links (`// GITHUB`, `// LINKEDIN`, `// EMAIL`, `// RESUME`) centered below the button in periwinkle mono with orange `//` prefix so that they feel like terminal directory entries.
63. As a visitor, I want the footer metadata (`FARHAN_MOHAMMED © 2026` left, `PORTFOLIO.EXE` right) to be at the very bottom of the viewport, separated from the CTA area so that it does not crowd the CTA.

### Card-Deck Stacking
64. As a visitor, I want each major section (Hero, Projects outer, Skills, each Timeline panel, Contact) to be `position: sticky; top: 0` so that sections stack as I scroll.
65. As a visitor, I want the outgoing section to scale down to ~0.95 and dim to ~0.75 opacity as the next section enters so that the depth layering is physically legible.
66. As a visitor, I want no blur on stacked sections so that the visual stays clean.
67. As a visitor, I want no border-radius on section surfaces so that the sharp edges are preserved throughout the stack.
68. As a visitor, I want the Projects outer layer to participate in the card-deck stack while the inner carousel handles horizontal movement independently so that the two behaviors do not interfere.

### Browser Chrome
69. As a visitor, I want text selection to show orange background with graphite text so that the selection color is on-brand.
70. As a visitor, I want the scrollbar thumb to be orange and square (no border-radius) on the graphite track so that the scrollbar is on-brand.

## Implementation Decisions

- **CSS anchor file.** Create `src/portfolio.css` as `@layer components { … }` containing the component rules from `ideas/Portfolio.html` lines 11–233 verbatim, adapted only to use the Tailwind v4 token variable names already defined in `src/index.css` (e.g. `var(--color-graphite)` instead of `var(--graphite)`). Import this file in `src/main.tsx`. Do not duplicate the `:root` token block.

- **Class name convention.** Component rules use the same class names as `ideas/Portfolio.html`: `.hero-name`, `.pcard`, `.tl-org`, `.footer-big`, etc. React components apply these class names directly. Tailwind utilities may still be used for structural helpers not covered by `src/portfolio.css` (e.g. `flex`, `relative`, `z-10`), but must not override any property already set by a portfolio class.

- **HeroSection.** The `<h1>` applies `hero-name`. Name is split into two `<span className="hero-name-line">` block elements. `// PORTFOLIO_INIT` uses `TypeIn` and gets class `hero-init`. The bar gets class `hero-bar`. Background grid element gets class `hero-grid` (line grid + radial mask fade, replaces current dot grid). Padding is set via `hero-inner` (5vw). CTA row uses `hero-cta`, buttons use `btn btn-fill` / `btn btn-outline`.

- **ProjectsSection.** Header row children get `hscroll-no`, `hscroll-name`, `hscroll-rule`. Progress counter and bar are added using `hscroll-progress`, `hscroll-progress-track`, `hscroll-progress-fill`. Scroll hint uses `hscroll-hint`. Edge spacers use `proj-edge`. Card uses `pcard` + `pcard-bg` + `pcard-fill` + `pcard-body` + `pcard-ghost` + `pcard-num` + `pcard-name` + `pcard-desc` + `pcard-tags` + `pcard-links`. Tag colors use `ptag ptag-{color}`. Links use `plink`. Card dimensions come from `.pcard` CSS (`min(560px, 78vw)` × `min(640px, 76vh)`). The diagonal fill animation uses the mask-position approach from the reference.

- **SkillsSection.** Grid container gets class `bento`. Each tile gets `bi bi-{area} c-{color}` classes. Reveal order is a static deterministic array sorted largest-first: `['py','js','dk','re','cc','nd','nx','fl','gt','pg','fg','mn']` then palette. `transitionDelay` is derived from this array index.

- **TimelineSection.** Section-type label uses two separate elements: `<span className="tl-section-slash">//</span>` + `<span className="tl-section-kind">{entry.kind}</span>` inside a `tl-section-tag` wrapper. Institution uses `tl-org`. Role uses `tl-title`. Bullets use `tl-bullets`. Commit/author/date use `tl-commit` / `tl-meta`. Timeline section header row uses the same `hscroll-head` / `hscroll-no` / `hscroll-name` / `hscroll-rule` / `hscroll-progress` pattern as Projects.

- **ContactSection.** Merged into a single `<footer id="contact">` element. Heading uses `footer-big` and `footer-big-line` spans. Layout uses `footer-cta`. Social links use `slink` class. Footer metadata row uses `footer-copy`.

- **Cursor rule.** A file at `.cursor/rules/portfolio-css.md` with the following constraint: all classes defined in `src/portfolio.css` are verbatim from the reference and must not be replaced with Tailwind equivalents. Any new elements must check `src/portfolio.css` before reaching for Tailwind.

- **Scrollbar.** Remove `border-radius: 4px` from `::-webkit-scrollbar-thumb` in `src/index.css`.

- **Nav active state.** The `>` caret appears on hover only, not on active. Active state = orange label text + orange `::after` underline scoped to the label only (not the caret area). No box border on active state.

- **What does not change.** React component structure, hook interfaces (`useHorizontalScroll`, `useCardDeckDepth`, `useActivePanel`), Vitest test file structure, and Framer Motion usage for card-deck depth and the Projects carousel translate offset.

## Testing Decisions

Good tests verify observable output (rendered DOM structure, presence of expected elements, hook return values) rather than implementation details (which internal CSS class was chosen). Do not test font-size or color values — those are browser rendering concerns verified by manual QA against the reference screenshots.

- `src/index-css.test.ts` — extend to assert `border-radius` is absent from the scrollbar thumb rule.
- `HeroSection.test.tsx` — assert hero name renders two `hero-name-line` span elements; assert `hero-init` text is present; assert `hero-bar` element exists.
- `ProjectsSection.test.tsx` — assert progress counter element is present; assert scroll hint element is present; assert each card has a `pcard-ghost` element; assert tag elements have `ptag` class.
- `SkillsSection.test.tsx` — assert tile reveal `transitionDelay` values are identical across two renders (determinism check).
- `TimelineSection.test.tsx` — assert `tl-section-slash` and `tl-section-kind` are separate sibling elements; assert `tl-org` element contains institution text.
- `ContactSection.test.tsx` — assert heading element has `footer-big` class; assert social link elements have `slink` class.
- Scroll hook behavior (`useHorizontalScroll`, `useCardDeckDepth`) is already tested; do not re-test.
- Card-deck depth transitions and scroll motion are browser-only concerns and require manual verification against the reference screenshots.

## Out of Scope

- Contact form backend or email service integration.
- CMS or content management for projects and resume data.
- Mobile responsive redesign — desktop visual alignment is the current priority; mobile work begins only after the desktop view passes visual QA against the reference screenshots.
- Accessibility audit (`aria-*` attributes, keyboard navigation beyond existing focus handling, reduced-motion media query).
- Performance optimization (bundle splitting, image optimization, Lighthouse audit).
- Dark/light mode toggle.
- Internationalization.
- Analytics beyond the existing Vercel Analytics integration.

## Further Notes

- **Visual source of truth.** `ideas/Portfolio.html` is the primary CSS reference. The six screenshots (`ideas/home.png`, `ideas/proj.png`, `ideas/skills.png`, `ideas/timeline.png`, `ideas/timeline 2.png`, `ideas/cta.png`) are the visual QA targets. For any ambiguity between the HTML source and a screenshot, the screenshot takes precedence since it reflects the rendered output.

- **Content source of truth.** `public/resume.pdf` is the canonical content source for names, dates, roles, institutions, project descriptions, and technologies. Do not invent content to fill layouts.

- **Relation to existing issues.** Issues #154–161 and #164 describe specific sub-tasks that remain valid under this PRD. This document supersedes the deleted `PRD.md` and `DESIGN.md`.

- **Desktop QA gate.** Before marking any issue done, run the app in a browser and compare the implemented section against `ideas/Portfolio.html` (opened in browser) and the matching reference screenshot. Note intentional deviations explicitly. Open a follow-up issue for any unexplained deviation.
