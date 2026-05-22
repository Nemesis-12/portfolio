# Portfolio v4 - PRD

## Problem Statement

The portfolio now mostly follows the canonical visual language from `ideas/Portfolio.html`, but the interactive scroll behavior has drifted away from the reference. The largest regression is that a global card-deck/sticky-stack interpretation was applied to the whole app. That made normal sections, timeline entries, and the Projects carousel fight each other for scroll ownership.

The user-facing failures are:

| Desired behavior from the reference | Current failure mode | User impact |
|---|---|---|
| Normal vertical page flow with sticky internals only where the reference uses them | Global sticky/card-stack behavior was applied across the app | Sections disappear, overlap, or become unreachable |
| Projects scrolls horizontally inside a tall section with one landing point per project | Extra dead-zone math and card depth states alter the pacing | First/last cards and section exits feel wrong |
| Timeline is one major section with a horizontal panel track | Each timeline entry became its own global sticky section | Only some timeline content appears and the intended slide direction is lost |
| Page uses CSS scroll snap proximity and invisible anchors for Projects/Timeline stops | Snapping is missing or applied at the wrong level | Scrolling does not settle cleanly per section/card/entry |
| Document itself has no horizontal overflow | `100vw` surfaces and wide tracks can leak beyond the viewport | A horizontal scrollbar appears |

The design source of truth is still the standalone HTML reference. The implementation should use React modules and tests, but the behavior should match the reference instead of preserving accidental behavior introduced during the port.

## Solution

The solution has four parts:

**Part 1 - Preserve the CSS anchor.** Keep `src/portfolio.css` as the visual anchor derived from `ideas/Portfolio.html`. Its component class names, typography, spacing, colors, sharp corners, clipped project cards, bento grid, browser chrome, and terminal visual language remain the source of truth for rendering.

**Part 2 - Restore the HTML scroll model.** Replace the global card-deck sticky interpretation with the reference scroll model: normal vertical sections; `scroll-snap-type: y proximity`; no document horizontal overflow; smooth scroll only for explicit navigation/CTA jumps; sticky internal viewports only for Projects and Timeline.

**Part 3 - Rebuild Projects and Timeline as deep scroll modules.** Projects should expose a simple horizontal-section progress interface that maps a tall vertical section to a horizontal track. Timeline should expose a simple quantized-panel-track interface that maps vertical progress to the intended newest-to-oldest horizontal slide. Both modules should be testable without relying on browser-only visual assertions.

**Part 4 - Update tests and agent guidance.** Tests and PRD language must reject the old global sticky/card-deck stack. Future agents should not reintroduce `useCardDeckDepth`-style global section scaling, per-timeline-entry global sticky pages, or document-level horizontal overflow.

## User Stories

### Loading Screen
1. As a visitor, I want the loading screen to be full-screen graphite so that the boot sequence feels immersive and intentional.
2. As a visitor, I want to see a pixel-font `FARHAN / MOHAMMED` identity during boot so that the brand is established before the hero loads.
3. As a visitor, I want a thin orange progress bar that fills over roughly 2.6-3.0s so that the load pacing feels deliberate.
4. As a visitor, I want rotating terminal status messages (`LOADING_ASSETS`, `COMPILING_MODULES`, etc.) so that the boot sequence reads as a real system init.
5. As a visitor, I want the loading screen to fade smoothly into the hero so that there is no visual jump.

### Navbar
6. As a visitor, I want a fixed full-width navbar with translucent graphite background and backdrop blur so that it feels like a floating terminal bar.
7. As a visitor, I want the logo `FM_` in pixel font on the left so that the brand mark is consistent.
8. As a visitor, I want nav links in uppercase Space Mono with letter-spacing so that they read as terminal labels.
9. As a visitor, I want the active nav link to show orange text and an orange underline scoped only to the label so that the active state is precise.
10. As a visitor, I want the `>` caret to appear on hover only, not on active, so that hover and active feel distinct.
11. As a visitor, I want the navbar to remain fixed above Projects and Timeline while those sections run their internal scroll interactions.
12. As a visitor, I want the navbar active state to remain on Projects throughout the Projects internal scroll and on Timeline throughout the Timeline internal scroll so that the owning major section is clear.

### Hero
13. As a visitor, I want the hero section to be full-viewport and full-width so that the name dominates the screen without centering constraints.
14. As a visitor, I want the hero typing sequence to start after the loading screen leaves so that I can actually see the full intro.
15. As a visitor, I want `// PORTFOLIO_INIT` to type in character-by-character before the name starts so that the sequence feels like a system initializing.
16. As a visitor, I want a short orange bar below `// PORTFOLIO_INIT` whose left edge is aligned with the `//` start so that the bar reads as an underline for that label specifically.
17. As a visitor, I want the hero name (`FARHAN` / `MOHAMMED`) to be two separate stacked lines in Press Start 2P at `clamp(40px, 12vw, 180px)` so that the name dominates the viewport at any screen width.
18. As a visitor, I want the name to type in line-by-line (FARHAN completes, then MOHAMMED starts) so that the sequence has rhythm.
19. As a visitor, I want a blinking orange cursor at the end of MOHAMMED after it finishes typing so that it signals the terminal is waiting.
20. As a visitor, I want the rotating role line (e.g. `BUILDER`) in periwinkle Space Mono at `clamp(11px, 1.1vw, 15px)` with `letter-spacing: 5px` so that it reads as a status label beneath the name.
21. As a visitor, I want the value-prop line `// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.` in Space Mono below the role so that the one-line descriptor is readable and on-brand.
22. As a visitor, I want the CTA buttons to appear after the value-prop types in, using rectangular sharp-edged buttons so that they match the reference exactly.
23. As a visitor, I want the fill CTA (`VIEW_WORK`) to be orange with graphite text, and the outline CTA (`VIEW_RESUME`) to be a platinum-bordered ghost button so that the hierarchy between actions is clear.
24. As a visitor, I want the hero background to be a subtle line grid with a radial mask fade from the left so that the grid enhances depth without being decorative.
25. As a visitor, I want hero content to use `padding: 0 5vw` so that the layout breathes at all viewport widths.

### Projects Carousel
26. As a visitor, I want the Projects section to occupy one viewport of vertical scroll per project so that each project has a clear moment on screen.
27. As a visitor, I want the Projects sticky viewport to pin while the inner track translates horizontally so that the interaction matches the reference.
28. As a visitor, I want invisible snap anchors, one per project, so that scrolling settles with each project card centered instead of stopping halfway between cards.
29. As a visitor, I want the first and last cards to be reachable and centered through the same snap/pacing model as the middle cards so that no special dead-zone math is needed.
30. As a visitor, I want project cards to keep the reference scale and opacity rather than being suppressed by active/neighbor/far states so that the carousel feels like the HTML source.
31. As a visitor, I want each project card to be a large notched/clipped rectangle (`clip-path` polygon corners, not rounded) in platinum so that the cards feel physically distinct from the background.
32. As a visitor, I want a large low-opacity ghost number (`_01`, `_02`, etc.) behind the card content so that the card has depth and identity.
33. As a visitor, I want project titles to use Press Start 2P (`clamp(20px, 2vw, 26px)`) so that the name has display weight.
34. As a visitor, I want tags to be sharp rectangular blocks using the palette colors (yellow, fuchsia, blue, orange-outline) with no border-radius so that they match the reference tile system.
35. As a visitor, I want project links to use `// LABEL` plus an external-link arrow in terminal language so that the link style is consistent with the rest of the site.
36. As a visitor, I want a hover fill that moves diagonally from the top-left notch corner toward the bottom-right so that the fill feels physical and directional.
37. As a visitor, I want card content (title, tags, links, ghost number) to remain readable and transition to platinum-on-graphite during the hover fill so that the card is usable in both states.
38. As a visitor, I want a section header row showing `// 01  PROJECTS` so that the section is labeled in the reference style.
39. As a visitor, I want a progress counter in the header (`02 / 06`) and a thin orange progress bar so that I know where I am in the carousel.
40. As a visitor, I want a `SCROLL ->` hint at the bottom of the pinned viewport so that the scroll interaction is discoverable.
41. As a visitor, I want edge spacers before the first and after the last card so that the first and last cards can reach the centered position.

### Skills
42. As a visitor, I want the skills section to use the exact six-column `grid-template-areas` bento layout from the reference so that Python dominates the top-left and tile sizes communicate skill importance.
43. As a visitor, I want sharp rectangular bento tiles with strong palette blocks so that the grid feels like a physical mosaic.
44. As a visitor, I want the palette swatch tile in the bottom-right so that the design system is self-referential.
45. As a visitor, I want tiles to reveal in a randomized order each time the section enters view so that the cascade matches the reference and feels fresh.
46. As a visitor, I want the reveal to reset and replay when the section re-enters the viewport so that repeat visitors see the animation again.
47. As a visitor, I want category labels in small uppercase mono and skill names in bold mono so that each tile has a consistent two-line hierarchy.
48. As a visitor, I want the section header `// 02  SKILLS` in the reference style above the grid so that it is labeled consistently with Projects.

### Timeline
49. As a visitor, I want Timeline to be one major section with a sticky viewport and an internal horizontal track so that it behaves like the reference instead of becoming several global sticky pages.
50. As a visitor, I want the newest entry to start centered and scrolling to reveal older entries horizontally from the left so that the intentional reverse-chronological motion is preserved.
51. As a visitor, I want invisible snap anchors, one per timeline entry, so that each entry settles firmly in the viewport.
52. As a visitor, I want each timeline entry to occupy a full viewport-width panel within the horizontal track so that one entry is the clear focus at a time.
53. As a visitor, I want the section-type label (`// EDUCATION` or `// EXPERIENCE`) to appear at the top of each panel, with `//` in Space Mono and the section word in Press Start 2P, both in orange, so that the kind of entry is immediately clear.
54. As a visitor, I want the `//` to be visually smaller than the section word so that the hierarchy within the label is preserved.
55. As a visitor, I want the commit metadata (`commit <hash>`, `Author`, `Date`) to type in first in orange/periwinkle mono so that the git-log framing is established before the main content.
56. As a visitor, I want the institution/company name to type in as large Press Start 2P text (`clamp(28px, 4vw, 52px)`) so that it dominates the panel the way the hero name dominates the hero.
57. As a visitor, I want the role/title to appear in uppercase Space Mono below the institution name so that the content hierarchy goes: label, commit meta, institution, role, bullets.
58. As a visitor, I want each bullet to type in sequentially with a small delay between bullets so that the panel feels like a log being printed.
59. As a visitor, I want a panel's typed content to remain visible when it deactivates so that it does not blank during horizontal slide transitions.
60. As a visitor, I want a section header row `// 03  TIMELINE` with a progress counter (`01 / 05`) so that the entry position is always visible.
61. As a visitor, I want a `SCROLL v` hint at the bottom of the pinned viewport so that the scroll direction is clear.

### Contact / CTA
62. As a visitor, I want the contact section to be full-screen with `LET'S` on one line and `CONNECT.` on the next in Press Start 2P at `clamp(40px, 8vw, 120px)` so that the CTA dominates the viewport the same way the hero name does.
63. As a visitor, I want the text to be centered so that the CTA feels like a declaration.
64. As a visitor, I want the period `.` to be orange and followed by a blinking orange block cursor so that the terminal punctuation lands as a visual beat.
65. As a visitor, I want the contact type-in animation to reset and replay when the contact section re-enters view so that it matches the reference.
66. As a visitor, I want `SEND_MESSAGE ->` as a centered orange fill button below the heading so that the primary action is unmissable.
67. As a visitor, I want social links (`// GITHUB`, `// LINKEDIN`, `// EMAIL`, `// RESUME`) centered below the button in periwinkle mono with orange `//` prefix so that they feel like terminal directory entries.
68. As a visitor, I want the footer metadata (`FARHAN_MOHAMMED © 2026` left, `PORTFOLIO.EXE` right) to be at the very bottom of the viewport, separated from the CTA area so that it does not crowd the CTA.

### Scroll, Snap, and Navigation
69. As a visitor, I want the page to use normal vertical document flow so that major sections do not disappear behind a global sticky stack.
70. As a visitor, I want CSS scroll snapping to be proximity-based so that scrolling can settle naturally without feeling locked or hijacked.
71. As a visitor, I want Projects and Timeline to provide their own internal snap landing points so that multi-card/multi-entry sections are easy to navigate.
72. As a visitor, I want manual scrolling to remain native, while navbar and CTA jumps scroll smoothly to their target section, so that intentional navigation feels polished without changing wheel/trackpad behavior.
73. As a visitor, I want no global section scale-down, dimming, blur, or card-deck depth effect so that the app matches the reference scroll model.
74. As a visitor, I want decorative parallax to be bounded relative to each owning section so that parallax never drifts across unrelated sections.

### Browser Chrome
75. As a visitor, I want text selection to show orange background with graphite text so that the selection color is on-brand.
76. As a visitor, I want the scrollbar thumb to be orange and square on the graphite track so that the scrollbar is on-brand.
77. As a visitor, I want the document itself to have no horizontal scrollbar so that wide internal tracks do not leak outside their clipped viewports.

## Implementation Decisions

- **CSS anchor file.** Keep `src/portfolio.css` as `@layer components { ... }` containing the component rules from `ideas/Portfolio.html`, adapted only to use the Tailwind v4 token variable names already defined in `src/index.css` (e.g. `var(--color-graphite)` instead of `var(--graphite)`). Do not duplicate the `:root` token block.

- **Class name convention.** Component rules use the same class names as `ideas/Portfolio.html`: `.hero-name`, `.pcard`, `.tl-org`, `.footer-big`, etc. React components apply these class names directly. Tailwind utilities may still be used for structural helpers not covered by `src/portfolio.css`, but must not override any property already set by a portfolio class.

- **Global scroll model.** Match the reference: `html` uses native scroll behavior and proximity vertical scroll snap; `body` clips horizontal overflow; only `#hero`, `#skills`, and `#contact` snap directly as major one-screen sections. Projects and Timeline own their internal snap anchors. Do not implement a global card-deck stack, global sticky section wrapper, or outgoing section scale/opacity depth effect.

- **HeroSection.** The hero intro starts only after the loading screen completes. The `<h1>` applies `hero-name`. Name is split into two `<span className="hero-name-line">` block elements. `// PORTFOLIO_INIT` uses `TypeIn` and gets class `hero-init`. The bar gets class `hero-bar`. Background grid element gets class `hero-grid`. Padding is set via `hero-inner` / section spacing. CTA row uses `hero-cta`, buttons use `btn btn-fill` / `btn btn-outline`.

- **Horizontal progress module.** Extract or keep a deep module that accepts an outer section and an inner track and returns `{ tx, progress }`. It computes progress from the section's bounding rect, the section height, and the viewport height. It computes horizontal distance from `track.scrollWidth - viewportWidth`. It does not know about Projects-specific card data.

- **ProjectsSection.** Projects uses one viewport of section height per project. The section contains an internal sticky viewport (`hscroll` / `hscroll-sticky`) and a horizontally translated `hscroll-track proj-track`. It renders one `snap-anchor` per project at `i * 100vh` so CSS snap settles per card. Header row children get `hscroll-no`, `hscroll-name`, `hscroll-rule`. Progress counter and bar use `hscroll-progress`, `hscroll-progress-track`, `hscroll-progress-fill`. Scroll hint uses `hscroll-hint`. Edge spacers use `proj-edge`. Card uses `pcard` + `pcard-bg` + `pcard-fill` + `pcard-body` + `pcard-ghost` + `pcard-num` + `pcard-name` + `pcard-desc` + `pcard-tags` + `pcard-links`. Tag colors use `ptag ptag-{color}`. Links use `plink`. Card dimensions come from `.pcard` CSS (`min(560px, 78vw)` by `min(640px, 76vh)`). The diagonal fill animation uses the mask-position approach from the reference. Do not add active/neighbor/far scale or opacity suppression.

- **SkillsSection.** Grid container gets class `bento`. Each tile gets `bi bi-{area} c-{color}` classes. Reveal order is randomized each time the section enters view, matching the reference behavior. The reveal resets when the section leaves view so it can replay on re-entry.

- **TimelineSection.** Timeline is one major section, not one global sticky section per entry. It uses a tall section equal to `timelineEntryCount * viewportHeight`, an internal sticky viewport, and a horizontally translated track. Timeline entries remain newest-first in content semantics, but the rendered track order is reversed so the newest entry starts centered and scrolling reveals older entries horizontally from the left. The track translation is quantized to panel positions with a smooth transform transition. Render one `snap-anchor` per entry at `i * 100vh`. Section-type label uses two separate elements: `<span className="tl-section-slash">//</span>` + `<span className="tl-section-kind">{entry.kind}</span>` inside a `tl-section-tag` wrapper. Institution uses `tl-org`. Role uses `tl-title`. Bullets use `tl-bullets`. Commit/author/date use `tl-commit` / `tl-meta`. Timeline section header row uses the same `hscroll-head` / `hscroll-no` / `hscroll-name` / `hscroll-rule` / `hscroll-progress` pattern as Projects.

- **ContactSection.** Merged into a single `<footer id="contact">` element. Heading uses `footer-big` and `footer-big-line` spans. Layout uses `footer-cta`. Social links use `slink` class. Footer metadata row uses `footer-copy`. The contact heading type-in resets and replays when Contact leaves and re-enters view.

- **Active navigation.** Use major-section geometry sampling around 40% of the viewport height, as in the reference, so the active nav item remains `PROJECTS` for the whole Projects internal scroll and `TIMELINE` for the whole Timeline internal scroll. Navbar/CTA click handlers should call smooth `scrollTo` on explicit jumps; global CSS should not force smooth behavior on all scrolling.

- **Parallax.** Parallax transforms are section-relative. Each parallax element computes movement from scroll offset relative to its owning section or footer so transforms remain bounded inside that section.

- **Browser chrome and overflow.** Remove `border-radius: 4px` from `::-webkit-scrollbar-thumb`. Set document horizontal overflow to hidden. Prefer `width: 100%` over `100vw` where it avoids scrollbar-induced overflow and does not change the rendered reference layout; keep intentionally wide internal tracks clipped by their sticky viewport.

- **Nav active state.** The `>` caret appears on hover only, not on active. Active state = orange label text + orange `::after` underline scoped to the label only. No box border on active state.

- **Content source.** Keep the current app's real project and timeline content. `ideas/Portfolio.html` is the motion/visual reference, not the content source.

- **What must be removed.** Remove or stop using global card-deck depth behavior, per-entry global Timeline sticky sections, Projects dead-zone progress math, and Project active/neighbor/far scale/opacity states. These are incorrect interpretations of the reference.

## Testing Decisions

Good tests verify observable output (rendered DOM structure, presence of expected elements, hook return values, and scroll math outputs) rather than implementation details. Do not test font-size or color values; those are browser rendering concerns verified by manual QA against the reference screenshots.

- `src/index-css.test.ts` - assert `body` clips horizontal overflow and `border-radius` is absent from the scrollbar thumb rule.
- `HeroSection.test.tsx` - assert hero name renders two `hero-name-line` span elements; assert `hero-init` text is present; assert `hero-bar` element exists; assert intro can be started after loading completes.
- `ProjectsSection.test.tsx` - assert the section height is one viewport per project; assert one `snap-anchor` per project; assert progress counter element is present; assert scroll hint element is present; assert each card has a `pcard-ghost` element; assert tag elements have `ptag` class; assert cards do not carry active/neighbor/far scale/opacity state attributes.
- `SkillsSection.test.tsx` - assert tiles reset/replay on viewport re-entry; mock randomness or isolate reveal-order generation so tests verify "new order can be generated on entry" without depending on a specific random sequence.
- `TimelineSection.test.tsx` - assert Timeline renders as one major section; assert entries are panels in one horizontal track; assert one `snap-anchor` per entry; assert newest content is the first user-facing panel; assert `tl-section-slash` and `tl-section-kind` are separate sibling elements; assert `tl-org` element contains institution text.
- `ContactSection.test.tsx` - assert heading element has `footer-big` class; assert social link elements have `slink` class; assert type-in state resets when the section leaves view and restarts on re-entry.
- Navbar/shell tests - assert active nav remains on the owning major section for the full Projects and Timeline scroll ranges. Assert explicit nav jumps use smooth scroll behavior.
- Scroll hook tests - test horizontal progress math and Timeline quantization as pure or hook-level behavior. Do not re-test browser rendering.
- Regression tests - assert no global card-deck depth hook/style mutates section scale or opacity, and assert document-level horizontal overflow is clipped.
- Browser QA - card centering, CSS scroll snap feel, Timeline slide direction, parallax, and no horizontal scrollbar require manual verification against `ideas/Portfolio.html` and the `curr_*` screenshots.

## Out of Scope

- Contact form backend or email service integration.
- CMS or content management for projects and resume data.
- Mobile responsive redesign; desktop visual and scroll alignment is the current priority.
- Accessibility audit (`aria-*` attributes, keyboard navigation beyond existing focus handling, reduced-motion media query).
- Performance optimization (bundle splitting, image optimization, Lighthouse audit).
- Dark/light mode toggle.
- Internationalization.
- Analytics beyond the existing Vercel Analytics integration.
- Replacing React with the standalone HTML implementation.

## Further Notes

- **Visual and behavior source of truth.** `ideas/Portfolio.html` is the primary CSS and scroll-behavior reference. The `curr_*` screenshots in `ideas/` are current-state QA artifacts. For any ambiguity between the HTML source and a screenshot, the screenshot takes precedence only for rendered visual output; the HTML source takes precedence for scroll mechanics.

- **Content source of truth.** `public/resume.pdf` is the canonical content source for names, dates, roles, institutions, project descriptions, and technologies. Do not invent content to fill layouts.

- **Reference scroll facts.** The reference uses `body { overflow-x: hidden }`, `html { scroll-snap-type: y proximity }`, `snap-anchor` elements with `scroll-snap-stop: always`, one viewport of Projects height per project, one viewport of Timeline height per entry, smooth scroll only for explicit nav jumps, section-relative parallax, and active nav sampling around 40% of viewport height.

- **Relation to existing issues.** Issues #154-161 describe visual sub-tasks that remain valid under this PRD. Any issue or test that requires global sticky/card-deck stacking, `useCardDeckDepth`-style scale/opacity, or each Timeline entry as a global sticky section is superseded by this update.

- **Desktop QA gate.** Before marking any issue done, run the app in a browser and compare the implemented behavior against `ideas/Portfolio.html` and the matching current/reference screenshot. Note intentional deviations explicitly. Open a follow-up issue for any unexplained deviation.
