# Refactor Portfolio to Match Reference Design

## Problem Statement

The portfolio website still depends on `framer-motion` in 7 source files (App.tsx, HeroSection.tsx, HeroSection.constants.ts, ContactSection.tsx, ProjectsSection.tsx, Navbar.tsx, MobileMenu.tsx) for hover effects, scroll hints, overlay animations, and cursor blinking. The skills section renders 12 tiles but the resume lists 19 discrete tool/framework/language skills. The timeline has 3 entries but the resume has 4 (missing NetApp SWE Intern) and 2 existing entries have incorrect dates. The `ptag-orange` tag variant uses a graphite background with orange text instead of the solid orange fill specified in the reference design.

## Solution

Remove `framer-motion` entirely, replacing all remaining usages with vanilla CSS (`@keyframes`, transitions) and vanilla JS (`setTimeout` chains, `requestAnimationFrame`) in React hooks. Expand skills data to all 19 resume skills across the resume's 4 categories. Fix timeline data to include all 4 resume entries with correct dates. Invert `ptag-orange` styling. All content matches `public/resume.pdf` as the single source of truth.

## User Stories

1. As a visitor, I want to see a terminal-boot loading screen with animated progress bar and cycling status messages, so that the site sets a retro-terminal tone from the first moment.
2. As a visitor, I want to see the hero name ("FARHAN MOHAMMED") type out letter-by-letter in sequence with a blinking orange cursor, so that the landing feels alive.
3. As a visitor, I want to see the "// PORTFOLIO_INIT" label type out before the name starts, so the intro feels like a boot sequence.
4. As a visitor, I want to see a rotating role label (CS_STUDENT → DEVELOPER → BUILDER → etc.) that types in, holds, erases, and cycles, so I understand the owner's identity.
5. As a visitor, I want the tagline ("// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.") and CTA buttons to fade up with staggered delays after the name finishes typing, so the reveal feels choreographed.
6. As a visitor, I want to click "VIEW_WORK" to smooth-scroll to the projects section, so I can navigate easily.
7. As a visitor, I want to click "VIEW_RESUME" to open `/resume.pdf` in a new tab, so I can read the full resume.
8. As a visitor, I want the navbar to highlight the currently visible section with an orange caret, underline, and label color change, so I always know where I am on the page.
9. As a visitor on mobile, I want to tap a hamburger icon that opens a full-screen overlay menu with all nav links, so I can navigate on small screens.
10. As a visitor on mobile, I want the full-screen menu to dismiss when I tap a link or a close button, so navigation is seamless.
11. As a visitor, I want to scroll vertically through the projects section and see project cards translate horizontally in a sticky viewport, so browsing projects feels cinematic.
12. As a visitor, I want each project card to show a diagonal orange fill animation on hover (mask-position slide), so cards feel interactive.
13. As a visitor, I want project card tag colors to auto-cycle through the palette (orange, blue, fuchsia, yellow) by position, so tags are colorful without manual assignment.
14. As a visitor, I want the orange tag variant to render as solid orange background with dark text (inverted from the current dark-bg/orange-text style), so it matches the desired design.
15. As a visitor, I want the projects section to work correctly with any number of cards (currently 2), scaling scroll distance proportionally, so the section works now and when more projects are added.
16. As a visitor, I want to see a bento grid of 19 skill tiles in a fixed-height container, with Python and PyTorch as large hero tiles and the rest at standard/small sizes, so I can quickly scan technical skills.
17. As a visitor, I want the skill tiles to fade in with randomized stagger order when the section scrolls into view, and reset when scrolled away, so the reveal feels fresh each time.
18. As a visitor, I want to see a palette tile with 4 vertical color bars (orange, yellow, fuchsia, blue) in the bento grid, so the design system is visually communicated.
19. As a visitor, I want to scroll vertically through the timeline section and see full-viewport panels slide horizontally, with each entry snapping into place, so browsing experience/education feels like flipping through git commits.
20. As a visitor, I want each timeline panel to type out its fields (commit hash, author, date, org, title, bullets) with staggered delays when that panel becomes active, so it feels like a terminal log being written.
21. As a visitor, I want persistent blinking carets on the organization name and title after they finish typing, so the terminal aesthetic is maintained.
22. As a visitor, I want the timeline to display 4 entries from the resume: NetApp SWE Intern, NetApp SWE in Test, WSU M.S., WSU B.S., so the content is accurate.
23. As a visitor, I want section tags (// EDUCATION, // EXPERIENCE) displayed at the top of each timeline panel, so I understand the category.
24. As a visitor, I want the footer to type out "LET'S" then "CONNECT" with a blinking cursor when the section scrolls into view, so the call-to-action has dramatic presence.
25. As a visitor, I want the "SEND_MESSAGE" button to open a mailto link to famohammed@shockers.wichita.edu, so I can easily get in touch.
26. As a visitor, I want footer social links (GITHUB, LINKEDIN, EMAIL, RESUME) to point to real URLs, so I can find the owner on other platforms.
27. As a visitor, I want subtle parallax movement on the hero grid, hero name, and footer text driven by scroll position, so the page has depth.
28. As a visitor, I want `.reveal` elements to fade up when they enter the viewport via IntersectionObserver, so content appears gracefully.
29. As a visitor on mobile (≤760px), I want the bento grid to collapse to a 2-column layout with auto-sized tiles, so skills are readable on small screens.
30. As a visitor on mobile, I want project cards to be wider (88vw) and shorter (64vh), so they're usable on narrow viewports.
31. As a visitor, I want the custom scrollbar (orange thumb on dark track) and orange text selection, so the terminal aesthetic extends to browser chrome.

## Current Codebase State (commit 1379509)

### What exists in code (not verified at runtime):

- **LoadingScreen.tsx** — uses vanilla CSS `@keyframes lf` for progress bar, `setTimeout`/`setInterval` for message cycling, `.out` CSS class for fade-out. No framer-motion in the component itself.
- **TypeIn.tsx, RotatingRole.tsx, Typewriter.tsx, useTypewriter.ts** — pure React (`useState` + `setTimeout`). No framer-motion imports.
- **HeroSection.tsx** — uses `TypeIn` for name typing chain, `RotatingRole` for roles. Still uses `motion.span` for blinking cursors and `motion.div` for CTA fade-up.
- **ProjectsSection.tsx** — uses `useHorizontalScroll` for horizontal translation. Still uses `motion.div` for scroll hint, `motion.article` for card hover lift. Edge spacer geometry and `.pcard-clip` wrapper were changed in PRs #279–#280.
- **TimelineSection.tsx** — uses `useTimelineScroll` for horizontal translation with quantized panel positions. No framer-motion imports. Uses `useTypewriter` for per-panel typing. Does NOT apply `.caret` class for persistent blinking carets on org/title.
- **SkillsSection.tsx** — renders 12 tiles with IntersectionObserver-driven stagger reveal. Uses CSS transitions, no framer-motion.
- **ContactSection.tsx** — uses `TypeIn` for "LET'S" and "CONNECT" with viewport reset. Still uses `motion.a` for button/link hover (`hoverEase`) and `useInView` from framer-motion.
- **Navbar.tsx** — active state via `useActiveMajorSection`. Still uses `motion.button` for hamburger hover (`hoverEase`).
- **MobileMenu.tsx** — uses `AnimatePresence` + `motion.div` for overlay fade, `motion.button` for close hover, `motion.a` for link hover.
- **App.tsx** — wraps `LoadingScreen` in `AnimatePresence`. Has `requestAnimationFrame` parallax listener. Imports `@vercel/analytics` and `@vercel/speed-insights`.
- **StickySection.tsx** — minimal 25-line wrapper, renders `<section>` or `<footer>` with `min-h-screen`.
- **variants.ts** — exports `fadeUp`, `sectionFade`, `hoverEase` framer-motion variant objects.
- **HeroSection.constants.ts** — imports `type { Variants } from 'framer-motion'` for `cursorVariants`.
- **portfolio.css** — has `.cursor` + `@keyframes blink-cursor` (line 186), `.hero-fade` + `@keyframes fade-up` (line 188), `.caret` (line 241). These are CSS equivalents that could replace framer-motion cursor/fade-up usages.
- **index.css** — has `scroll-snap-type: y proximity`, scrollbar styling (orange thumb, graphite track), orange text selection, `overflow-x: clip` on html and body.
- **portfolio.css** — has `.snap-anchor` rules with `scroll-snap-stop: always`, `.reveal` class with CSS transition, `@media (max-width:760px)` breakpoint with bento 2-col and card sizing.
- **App.tsx** — has `data-parallax` listener using `requestAnimationFrame`. Hero grid and footer text have `data-parallax` + `data-parallax-factor` attributes.

### What needs to change:

**framer-motion removal (7 files still import it):**
- `App.tsx` — replace `AnimatePresence` wrapping `LoadingScreen` with conditional rendering
- `HeroSection.tsx` — replace `motion.span` cursors with CSS `.cursor` class, replace `motion.div` CTA fade-up with CSS `.hero-fade` class
- `HeroSection.constants.ts` — remove `import type { Variants } from 'framer-motion'`, redefine `cursorVariants` without framer-motion types
- `ContactSection.tsx` — replace `useInView` with vanilla `IntersectionObserver`, replace `motion.a` hover with CSS `:hover` transform
- `ProjectsSection.tsx` — replace `motion.div` scroll hint with CSS transition, replace `motion.article` card hover lift with CSS transform
- `Navbar.tsx` — replace `motion.button` hamburger hover with CSS `:hover` transform
- `MobileMenu.tsx` — replace `AnimatePresence` + `motion.*` with CSS class-toggled transitions
- `src/animations/variants.ts` — delete this file after all consumers are migrated

**Skills data expansion (12 → 19 tiles):**
Current tiles: Python (`large: true`), TypeScript, Docker, JavaScript, C/C++ (combined), NumPy, FastAPI, PyTorch, Hugging Face, Scikit-learn, Pandas, Git
Current categories: LANGUAGE, FRAMEWORK, TOOL, ML / DL, DATA (5 categories)

Resume skills (19 tile-worthy items, 4 categories):
- ML/DL: PyTorch, Transformers, Hugging Face (3)
- Data & Computation: NumPy, Pandas, Scikit-learn, Matplotlib (4)
- Languages: Python, C++, C, SQL, JavaScript, TypeScript (6)
- Tools & Systems: Git, Docker, Linux, Ansible, Jupyter, FastAPI (6)

Changes needed:
- Add 7 missing tiles: Transformers, Matplotlib, SQL, C (separate from C++), Linux, Ansible, Jupyter
- Split C/C++ into separate C++ and C tiles
- Mark PyTorch as `large: true` (currently not marked large)
- Change categories from 5 to 4, matching resume exactly
- Redesign grid template areas to accommodate 19 tiles

**Palette tile layout change:**
Current CSS (`.bi-pal`): `display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr` (2×2 grid)
Target: 4 equal-width vertical bars using `flex` with `flex-direction: row` and full-height divs

**Timeline data (3 → 4 entries + date corrections):**
Current entries and their errors:
1. NetApp — SOFTWARE_ENGINEER_IN_TEST — "AUG 2024 – PRESENT" → should be "JUL 2024 – JUN 2026" per resume
2. WSU — ACCELERATED_M.S._COMPUTER_SCIENCE — "JAN 2026 – DEC 2027 (EXPECTED)" → should be "JAN 2026 – MAY 2027 (EXPECTED)" per resume
3. WSU — B.S._COMPUTER_SCIENCE — "JAN 2022 – DEC 2025" (matches resume)

Missing entry from resume: NetApp — SOFTWARE_ENGINEER_INTERN — "JUN 2026 – PRESENT" with bullet: "Contributed to web platform development in TypeScript and PostgreSQL, implementing API endpoints, refactoring existing code, and reviewing pull requests"

**Timeline blinking carets:**
`.caret` CSS class exists in `portfolio.css` line 241 but is not used in `TimelineSection.tsx`. Needs to be applied to org name and title elements after they finish typing.

**ptag-orange CSS inversion:**
Current (`portfolio.css` line 120): `background:var(--color-graphite);color:var(--color-atomic-tangerine);box-shadow:inset 0 0 0 1px var(--color-atomic-tangerine)`
Target: `background:var(--color-atomic-tangerine);color:var(--color-graphite)` (solid fill, no border)

## Implementation Decisions

- **Remove `framer-motion` entirely.** Replace all remaining usages with vanilla CSS equivalents. The `AnimatePresence` wrapper in App.tsx becomes conditional rendering (LoadingScreen already handles its own fade-out via CSS `.out` class). The `motion.span` cursors in HeroSection use the existing `.cursor` CSS class with `@keyframes blink-cursor`. The CTA `motion.div` fade-up uses the existing `.hero-fade` CSS class. The `hoverEase` scale variants in Navbar, MobileMenu, and ContactSection become CSS `:hover` transforms. The scroll hint in ProjectsSection uses CSS transitions. The card hover lift uses CSS `transform` on hover/focus. The MobileMenu overlay uses CSS opacity transitions with class toggling. After all replacements, remove `framer-motion` from `package.json` and delete `src/animations/variants.ts`.
- **Typewriter animations** (`TypeIn`, `RotatingRole`, `Typewriter`, `useTypewriter`) are already pure React with no framer-motion dependency. No changes needed.
- **Horizontal scroll** for Projects uses `useScrollProgress` → `useHorizontalScroll`. Timeline uses `useScrollProgress` → `useTimelineScroll`. These hooks should be preserved.
- **`StickySection`** is a minimal wrapper. Projects and Timeline handle their own sticky viewport via `[data-sticky-viewport="true"]` divs. No changes needed.
- **Skills bento grid** needs expansion from 12 to 19 tiles across the resume's 4 categories. Python and PyTorch are the two `large` hero tiles. The 6-column grid template areas need redesign for 19 areas. The palette tile layout changes from 2×2 grid to 4 vertical bars. The existing IntersectionObserver stagger reveal should be preserved.
- **Tag color cycling** — `TAG_VARIANTS[tagIndex % TAG_VARIANTS.length]` exists in `ProjectsSection.tsx`. No color field in the data model; colors are derived at render time.
- **`ptag-orange` inversion** — change to `background: orange; color: graphite` (solid fill, no border).
- **Mobile breakpoint at 760px** exists in `portfolio.css`. MobileMenu needs framer-motion removal.
- **Data source** — all content must match `public/resume.pdf`. Projects data has Leviathan and MLA_IMPL. Timeline needs a 4th entry and date corrections. Skills need 7 new tiles and category restructuring.
- **Social links** — GitHub: `https://github.com/Nemesis-12`, LinkedIn: `https://linkedin.com/in/fa-mohammed`, Email: `mailto:famohammed@shockers.wichita.edu`, Resume: `/resume.pdf`.
- **CSS architecture** — two-file structure: `index.css` (Tailwind import + theme tokens) and `portfolio.css` (component rules in `@layer components`). The `@media (max-width: 760px)` breakpoint stays in `portfolio.css`.
- **Scroll snap** — `html { scroll-snap-type: y proximity }` exists in `index.css`. `.snap-anchor` divs exist in Projects and Timeline with `scroll-snap-stop: always`.
- **Parallax** — `data-parallax` + `data-parallax-factor` attributes exist on hero grid and footer text, driven by `requestAnimationFrame` scroll listener in `App.tsx`.

## Animation Inventory

All 14 animations and their current state in code:

1. **Typewriter intro** — `TypeIn` component chain exists: PORTFOLIO_INIT → FARHAN → MOHAMMED.
2. **Blinking cursor** — uses `motion.span` with framer-motion `cursorVariants`. CSS `.cursor` class with `@keyframes blink-cursor` exists in `portfolio.css` as a replacement target.
3. **Rotating role** — `RotatingRole` component exists, pure React.
4. **Hero fade-up** — uses `motion.div` with `ctaVariants`. CSS `.hero-fade` class with `@keyframes fade-up` exists in `portfolio.css` as a replacement target.
5. **Project card hover** — diagonal fill exists via CSS `mask-position` and `.pcard-clip` wrapper. Card lift uses `motion.article` with `animate={{ y: -4 }}` — needs CSS replacement.
6. **Skills bento reveal** — exists, CSS transitions + vanilla IntersectionObserver.
7. **Timeline typewriter** — `useTypewriter` with `mode: 'line'` exists, pure React.
8. **Timeline blinking carets** — NOT IMPLEMENTED. `.caret` CSS class exists but is not applied in `TimelineSection.tsx`.
9. **Footer typewriter** — `TypeIn` for "LET'S"/"CONNECT" exists with viewport reset. `useInView` from framer-motion needs vanilla replacement.
10. **Parallax layers** — `requestAnimationFrame` listener exists in `App.tsx`.
11. **Scroll reveal** — `.reveal` CSS class exists in `portfolio.css`.
12. **Horizontal scroll** — hook-driven `translateX` transforms exist in both Projects and Timeline.
13. **Nav active state** — CSS rules for caret, underline, orange label exist. Driven by `useActiveMajorSection` hook.
14. **Loading bar** — CSS `@keyframes lf` and `setTimeout` message cycling exist in `LoadingScreen.tsx`.

## Testing Decisions

Tests verify external behavior (what renders, what the user sees/clicks) rather than implementation details. The existing patterns use Vitest + React Testing Library + jsdom.

### Existing test seams to update:

- **Hook unit tests** (`useScrollProgress`, `useHorizontalScroll`, `useTimelineScroll`, `useActiveMajorSection`) — update if hook APIs change.
- **Component rendering tests** (`ProjectsSection.rendering.test.tsx`, `ProjectsSection.cards.test.tsx`, `ProjectsSection.scroll.test.tsx`, `LoadingScreen.test.tsx`, `Navbar.test.tsx`, `SkillsSection.test.tsx`, `HeroSection.test.tsx`, `ContactSection.test.tsx`, `TimelineSection.rendering.test.tsx` + other timeline test files) — update to remove framer-motion mocks where framer-motion is removed.
- **Animation component tests** (`TypeIn.test.tsx`, `RotatingRole.test.tsx`, `Typewriter.test.tsx`, `useTypewriter.test.ts`) — no framer-motion dependency, should not need changes.
- **CSS contract tests** (`portfolio-css.test.ts`, `portfolio-css-geometry.test.ts`, `index-css.test.ts`) — update for changed CSS classes (ptag-orange inversion, palette tile layout, new skill tile grid areas).

### New test seams:

- **MobileMenu overlay test** — assert overlay opens on hamburger click, all 5 nav links present, overlay closes on link click or close button.
- **Skills data completeness test** — assert all 19 skills from the resume are present, Python and PyTorch marked as `large`.
- **Tag color cycling test** — unit test the `TAG_VARIANTS[index % TAG_VARIANTS.length]` cycling.
- **Architecture regression test** — assert no file in `src/` imports from `framer-motion`.

### Prior art:
- `LoadingScreen.test.tsx` — timer-based animation testing with `vi.useFakeTimers()`
- `ProjectsSection.rendering.test.tsx` — DOM structure assertions for data-driven components
- `useActiveMajorSection.test.ts` — scroll-driven hook testing with mock viewport geometry
- `integration.smoke.test.ts` — cross-module maintainability smoke tests

## Out of Scope

- Adding more projects beyond the 2 currently on the resume (Leviathan, MLA_IMPL)
- A third responsive breakpoint for tablets (only desktop + mobile at 760px)
- Dark/light theme toggle
- Page transitions or route-based navigation (single-page scroll only)
- CMS or headless content management — data lives in TypeScript files
- SEO metadata, Open Graph tags, or analytics beyond existing Vercel integrations
- Accessibility audit beyond semantic HTML (ARIA, focus management are future work)
- Performance optimization (lazy loading, code splitting, image optimization)
- Contact form — SEND_MESSAGE is a mailto link only

## Further Notes

- `ideas/Portfolio.html` is the **styling and interaction reference only** — all content comes from `public/resume.pdf`.
- The reference HTML uses CDN-loaded React + Babel. The repo uses Vite + TypeScript + Tailwind, which is the target stack and should not change.
- The custom hooks (`useScrollProgress`, `useHorizontalScroll`, `useTimelineScroll`) should be preserved, not rewritten.
- CSS vanilla equivalents already exist for several framer-motion usages: `.cursor` + `@keyframes blink-cursor` (portfolio.css line 186), `.hero-fade` + `@keyframes fade-up` (line 188), `.caret` (line 241). Use these as replacements rather than creating new CSS.
- `framer-motion` should be removed from `package.json` and `src/animations/variants.ts` deleted after all component migrations are complete.
- `@vercel/analytics` and `@vercel/speed-insights` integrations must be preserved in the final `App.tsx`.
