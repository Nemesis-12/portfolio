# Portfolio v4 — PRD

## Problem Statement

The current portfolio codebase has diverged significantly from the v4 design reference (`ideas/Portfolio v4.html`). Three categories of problems exist:

1. **Visual bugs**: The `// PORTFOLIO_INIT` hero label sits too close to the navbar border and its orange underline bar is misaligned — the underline should align to the start of the `//`, not to the text after the slashes. The `// EDUCATION` and `// EXPERIENCE` section labels in the Timeline use the wrong font — both the `//` and the section word must be in Press Start 2P, orange, with `//` slightly smaller than the word.

2. **Missing scroll UX**: The site has no inter-section scroll transition. Sections replace each other flatly as the user scrolls, losing all sense of depth and layering.

3. **Projects carousel pacing**: Cards scroll by too quickly and the section has no entry/exit buffer, so the user teleports into and out of the horizontal carousel with no easing.

The redesign should also preserve the v4 reference's full-browser-width, full-viewport composition. The site should not feel boxed into a centered page shell; each major section should read as an immersive full-screen card in the stack.

---

## Solution

Rebuild all components to match `ideas/Portfolio v4.html` as the canonical design reference, then layer on:

- A **card-deck stacking effect** between sections: each new section slides up from below while the section beneath scales to ~0.95× and dims. The effect applies across Hero, Projects, Skills, each Timeline entry, Contact, and Footer. Projects is the one exception inside its own active viewport — the outer layer stays visually stable while the internal cards move.
- **Improved Projects carousel pacing**: ~1.5× viewport height per card, plus a 20–25vh dead-zone buffer at each end of the carousel.
- **Timeline redesigned as vertical stacked panels** — one full-screen panel per entry, newest first. The v4 horizontal scroll behavior is explicitly not desired.
- **Skills reveal changed to deterministic order** — largest/anchor tiles first, supporting tiles fan out after. Slower reveal than v4.
- **Bug fixes** for the hero init label spacing/alignment and the timeline section-label font.

---

## User Stories

1. As a visitor, I want to see a system-boot loading screen with a progress bar and rotating status messages, so that the site feels like a terminal initialising.
2. As a visitor, I want the loading screen to fade out after ~2.8 s, so that I land smoothly on the hero.
3. As a visitor, I want the portfolio to use the full browser width, so that the site feels immersive instead of boxed into the center.
4. As a visitor, I want each major section to feel like a full-screen card, so that the page has a strong intentional rhythm.
5. As a visitor, I want a fixed navbar with a blurred, semi-transparent graphite background and a subtle bottom border, so that I can navigate without losing context of the page.
6. As a visitor, I want navbar hover and active animations to be fast and subtle, so that navigation feels crisp.
7. As a visitor, I want the `>` caret on nav links to appear only on hover, not on the active item, so that hover and active states are visually distinct.
8. As a visitor, I want the active nav link to use orange label color and an orange underline scoped to the label text only, so that I always know which section I am in without visual noise from the caret.
9. As a visitor, I want the `FM_` logo in the navbar to jump to the hero when clicked, so that I can return to the top quickly.
10. As a visitor, I want the `// PORTFOLIO_INIT` label in the hero to have sufficient clearance below the navbar border, so that it reads as hero content rather than nav decoration.
11. As a visitor, I want the orange underline bar beneath `// PORTFOLIO_INIT` to align with the start of the `//`, so that the label and underline behave as one paired unit.
12. As a visitor, I want the hero name to appear via a typewriter animation (first line, then second), so that my attention is drawn to the name progressively.
13. As a visitor, I want a blinking block cursor to persist at the end of the hero name once typing completes, so that the terminal aesthetic is maintained.
14. As a visitor, I want a rotating role typewriter (`CS_STUDENT`, `DEVELOPER`, `BUILDER`, `DEBUGGER`, `PROBLEM_SOLVER`) to appear after the name types in, so that I get a quick read of who Farhan is.
15. As a visitor, I want the hero CTA buttons and value-prop line to fade up after the name animation completes, so that the call-to-action feels like a natural conclusion to the intro sequence.
16. As a visitor, I want a subtle dot-grid background in the hero that moves at a slower parallax rate than the content, so that there is a sense of depth when scrolling.
17. As a visitor, I want each section to slide up over the previous one like a card being dealt on top of a deck, so that scrolling feels layered and physical.
18. As a visitor, I want the section underneath to scale down to ~95% and dim as the new section covers it, so that the depth illusion is reinforced without being dramatic.
19. As a visitor, I want the stacking effect to apply across Hero, Projects, Skills, each Timeline entry, Contact, and Footer, so that the motion language is consistent throughout the site.
20. As a visitor, I want Projects to enter and exit with the stack effect, so that it does not feel disconnected from the rest of the page.
21. As a visitor, I want the Projects carousel itself to not use the card-stacking motion internally, so that two competing scroll effects do not fight each other.
22. As a visitor, I want Projects to use a sticky horizontal carousel that maps vertical scroll to horizontal card movement, so that I can browse projects without horizontal input.
23. As a visitor, I want each project card to have ~1.5× the viewport height of scroll distance, so that cards advance at a comfortable reading pace.
24. As a visitor, I want moving from one project card to the next to require slightly less than one full scroll beat, so that browsing does not feel sluggish or abruptly fast.
25. As a visitor, I want a 20–25vh dead zone at the start of the Projects carousel that holds the first card in place, so that I don't snap into the carousel immediately on entry.
26. As a visitor, I want a 20–25vh dead zone at the end of the Projects carousel that holds the last card in place, so that I don't snap out before I'm ready.
27. As a visitor, I want the active project card to be centered, so that the section has a clear initial and ongoing focal point.
28. As a visitor, I want neighboring project cards to remain partially visible to the left and right at lower opacity and subtle scale, so that I understand the carousel has more items.
29. As a visitor, I want project cards to remain card-shaped, not become full-width rows, so that the notched card design remains central.
30. As a visitor, I want each project card to show a ghost number, project name, concise description, colorful tags, and links, so that each card is scannable but complete.
31. As a visitor, I want project cards to be more text-led than the current heavy white-card implementation, so that the design feels sharper.
32. As a visitor, I want project cards to have a clipped-corner (notch) shape with a diagonal orange fill that slides in from the top-left notch to the bottom-right notch on hover or focus, so that the animation is tied to the notched shape.
33. As a visitor, I want the centered active card to remain unfilled (not orange) by default, so that active carousel state and hover/focus fill state are visually distinct.
34. As a visitor, I want project card text, tags, ghost numbers, and links to invert cleanly during orange fill, so that the card remains fully readable throughout the hover animation.
35. As a visitor, I want a progress indicator (`02 / 06` with a fill bar) in the Projects carousel header, so that I know how far through the project list I am.
36. As a visitor, I want the Projects scroll hint to be helpful but not visually dominant, so that it supports the interaction without cluttering the section.
37. As a visitor, I want the Skills section to reveal bento-grid tiles in a deterministic designed order, so that the reveal feels intentional instead of random.
38. As a visitor, I want the largest or most important Skills tiles to reveal first, then supporting tiles to fan out, so that the grid hierarchy is clear from the animation.
39. As a visitor, I want the Skills reveal to be slower than the v4 reference, so that the animation feels smoother and less jumpy.
40. As a visitor, I want the Skills bento grid to reset and re-animate if I scroll away and back, so that repeat visitors still get the animation.
41. As a visitor, I want each Timeline entry to be its own full-screen stacked panel using the same card-deck scroll model as the rest of the site, so that each milestone gets visual weight without requiring horizontal gestures.
42. As a visitor, I want Timeline panels in newest-first order, so that the most current and relevant experience appears first.
43. As a visitor, I want each Timeline panel to keep the v4 metadata style (`commit`, `Author`, `Date`) with a typewriter animation when the panel becomes active, so that the terminal commit metaphor is reinforced.
44. As a visitor, I want Timeline details to be bullet points rather than paragraph blocks, so that dense experience details are easier to scan.
45. As a visitor, I want the typewriter speed in Timeline to be fast enough for bullet lists, so that I am not forced to wait through long lines.
46. As a visitor, I want the `//` prefix and the section word (`EDUCATION` / `EXPERIENCE`) in Timeline panel labels to both use the pixel display font in orange, with `//` slightly smaller than the word, so that the heading matches the pixel heading system shown in the design reference.
47. As a visitor, I want Timeline stack transitions to ease smoothly, so that moving between milestones feels intentional.
48. As a visitor, I want the Contact section to be a full-screen CTA with large pixel text that types out `LET'S CONNECT.` with a blinking cursor when I scroll to it, so that the footer carries the same typewriter energy as the hero.
49. As a visitor, I want copyright and footer metadata to live in a separate compact area below the full-screen CTA, so that the CTA does not feel cluttered.
50. As a visitor, I want the final footer to be compact and calm, so that the ending feels complete without competing with the CTA.
51. As a visitor, I want social links in the footer to be prefixed with `//` in orange and to highlight white on hover, so that they match the terminal link language used elsewhere.
52. As a visitor on mobile, I want the same card-deck stacking effect as desktop, so that the experience feels consistent across devices.
53. As a visitor on mobile, I want the Projects carousel to remain usable with the same core card concept adapted to the screen, so that project browsing stays focused.
54. As a visitor on mobile, I want Timeline entries to remain full-screen stacked panels, so that each entry is readable without horizontal gestures.
55. As a visitor, I want an orange scrollbar thumb on a graphite track throughout the page, so that even the browser chrome fits the design system.
56. As a visitor, I want the `::selection` highlight to be orange with graphite text, so that text selection feels on-brand.

---

## Implementation Decisions

### Source of truth
`ideas/Portfolio v4.html` is the canonical visual reference for layout, typography, colors, notched cards, bento structure, and terminal tone. It is a reference, not production architecture — implementations adapt it cleanly to the React/TypeScript codebase. V4 behaviors that are explicitly **not** desired: horizontal Timeline scrolling, randomised Skills reveal.

`public/resume.pdf` is the canonical content reference. Project names, project descriptions, skills, education, experience, dates, titles, links, and any biographical copy should match the resume, not the placeholder or demo content in `ideas/Portfolio v4.html`. The HTML reference informs presentation only.

The page should use full-browser-width sections and full-viewport composition. Avoid reintroducing a centered page shell that makes the redesign feel boxed in.

### Design tokens
The token set from the HTML reference maps directly to the existing Tailwind theme:

| Token | Value |
|---|---|
| `--graphite` | `#2A2B2A` |
| `--graphite-lt` | `#323332` |
| `--orange` | `#FF8547` |
| `--platinum` | `#EFF1F3` |
| `--peri` | `#B2B6D2` |
| `--blue` | `#5200E0` |
| `--fuchsia` | `#E0007F` |
| `--yellow` | `#FFC857` |
| Press Start 2P | display / pixel font (`--font-display`) |
| Space Mono | body / mono font (`--font-body`) |

### Section stacking mechanism
Each stackable section gets `position: sticky; top: 0` so it pins while the viewport scrolls over it. A scroll listener on the following section's entry drives a `scale` + `opacity` transform on the current section as the follower slides in. No border-radius — sharp edges are preserved throughout. The effect applies to every section transition. The depth should be restrained: roughly a card receding behind the next card, not a dramatic zoom. Visual depth is achieved through transform and opacity only — no blur.

### Navbar
Fixed top, dark translucent graphite, backdrop blur, subtle bottom border. `FM_` logo on left, nav links on right. `>` caret is **hover-only** — it must not appear on the active item. Active state uses orange label color and orange underline scoped to the label text only (underline must not extend under the caret).

Navbar hover and active transitions should be fast and subtle.

### Horizontal scroll hook (`useHorizontalScroll`)
A single reusable hook takes an outer container ref and an inner content ref, reads `getBoundingClientRect` on scroll, computes a `[0, 1]` progress value, and returns `translateX` in pixels. Projects consumes it; Timeline does not (Timeline uses vertical stacking, not horizontal scroll).

### Projects carousel pacing
Total section height = `(PROJECTS.length * 1.5 + 1) * window.innerHeight`. The leading and trailing 20–25vh dead zones are modelled as clamped regions in the progress mapping: progress is held at `0` for the first ~20–25vh of the section's scroll range and at `1` for the last ~20–25vh, so the carousel holds on the first/last card during those buffers. The outer Projects layer stays visually stable once the section is active — only the cards and progress indicators move.

### Projects card states
Cards preserve the v4 notched-card structure and should not collapse into full-width rows. Each card includes a ghost number, project name, concise description, colorful tags, and links. The overall treatment should be text-led rather than dominated by heavy white-card surfaces.

Two states are separate and must not collapse:
- **Active/centered**: card is in focus position, readable, not orange.
- **Hover/focus**: triggers the diagonal orange fill from top-left notch to bottom-right notch. All content (text, tags, ghost number, links) must remain legible during fill via inversion or contrast adjustment.

Neighboring cards (left and right of center) remain partially visible with reduced opacity and subtle scale.

### Timeline — vertical stacked panels
Timeline is **not** a horizontal carousel. Each entry is its own full-screen stacked panel participating in the same card-deck scroll model as every other section. Panels are in newest-first order. Each panel includes the `// EXPERIENCE` or `// EDUCATION` heading, v4 metadata (`commit`, `Author`, `Date`), institution, role, and bullet-point details. The horizontal `hscroll-track` timeline behavior from v4 is explicitly not used.

### Timeline section label typography
Both the `//` and the section word (`EDUCATION` / `EXPERIENCE`) use the pixel display font (Press Start 2P) in orange. The `//` is slightly smaller than the word to preserve hierarchy while keeping both pixel-styled.

### Skills reveal — deterministic order
Remove randomised reveal. Reveal starts from the largest/anchor tiles first, then fans outward to smaller supporting tiles. Reveal speed is slower than v4 so each tile reads cleanly. The grid resets and re-animates on re-entry via IntersectionObserver.

### Typewriter components
Two distinct primitives:

- **`TypeIn`** — one-shot, driven by a `start: boolean` prop. Used in Hero and Footer. Fires `onDone` when complete.
- **`Typewriter`** — activation-driven, used in Timeline panels. Receives `active: boolean`; holds its current text when deactivated so panels don't blank during transition.

**`RotatingRole`** handles the type → hold → erase → next cycle for the hero subtitle.

### Parallax
A single RAF-keyed scroll listener reads all `[data-parallax]` elements, computes section-relative scroll offset, and applies `translate3d(0, offset * factor, 0)`. Initialised once at App level. Hero grid and footer text carry the most prominent parallax factors.

### Hero init label bug
The `// PORTFOLIO_INIT` label needs enough top padding/margin to clear the 56px navbar. The orange bar below it must align to the same left edge as the start of the `//` — not to the start of `PORTFOLIO_INIT`. Label and bar are treated as one paired unit.

### Mobile
Mobile uses the same card-deck stacking effect as desktop — not a simplified fade-only alternative. No reduced-motion fallback is required in this pass.

---

## Interaction Details

### Stacked section scroll
- Incoming section slides up over the outgoing section.
- Outgoing section remains visible underneath for part of the transition, with subtle dimming and scale-down (~0.95×).
- Effect applies consistently before and after Projects, not only between simpler sections.
- Stack does not cause content overlap that makes text unreadable.
- Navbar remains fixed above the stack at all times.

### Projects carousel
- Section enters with the first card centered.
- 20–25vh dead zone before card movement begins.
- Card track moves horizontally as the user scrolls vertically, at ~1.5× viewport per card.
- Movement should feel smooth and controlled; one card-to-card advance should feel close to, but slightly less than, one full scroll beat.
- 20–25vh dead zone at the end before the section releases.
- Neighboring cards remain partially visible with lower opacity and subtle scale to signal more items.
- Active centered card is readable and unfilled.
- Hover/focus triggers diagonal orange fill from top-left to bottom-right notch.
- Tags, ghost number, title, description, and links must remain legible during fill.
- Progress indicator shows current card index and fill bar.
- Scroll hint is present but visually secondary.

### Skills bento
- Six-column desktop bento, two-column mobile adaptation (matching v4).
- Deterministic reveal: largest/anchor tiles first, supporting tiles fan out.
- Slower reveal than v4 — each tile has time to read before the next fires.
- Hover brightness response is restrained.
- Grid resets and re-reveals on re-entry.

### Timeline stacked panels
- One full-screen panel per timeline entry, using the same stack-scroll model as other sections.
- Newest-first ordering.
- Each panel contains: `// EXPERIENCE` or `// EDUCATION` heading (both words pixel-styled, orange), `commit` hash, `Author`, `Date` metadata, institution, role, bullet-point details.
- Typewriter animates panel content when the panel becomes active.
- Typing speed is fast enough that bullet-list lines do not feel slow.
- Terminal cursor visible throughout typing.

### Hero alignment
- `// PORTFOLIO_INIT` and its underline form one aligned unit.
- The underline's left edge starts at the same position as the `//`.
- The label sits far enough below the navbar that it reads as hero content, not nav decoration.

---

## Testing Decisions

Good tests cover **observable output and user-facing behaviour**, not animation implementation internals like frame counts or internal state shape.

### Modules to test

- **`TypeIn`** — given `start=true`, emits the full text after all timeouts fire; given `start=false`, emits nothing; calls `onDone` exactly once.
- **`Typewriter`** — given `active=true`, types to completion; given `active` toggled false mid-type, holds current text and does not continue.
- **`RotatingRole`** — after one full cycle, the displayed text matches the second role.
- **`useHorizontalScroll`** — given a mocked bounding rect sequence, returns the expected `tx` and `progress` values.
- **`Navbar`** — `>` caret is absent in active state; active underline is scoped to the label element, not the caret.
- **`HeroSection`** — the init label and orange bar share the same left-column start.
- **`ProjectsSection`** — cards render ghost number, name, description, tags, and links; hover/focus state changes card contrast in a user-visible way; active carousel state and hover fill state are separate.
- **`SkillsSection`** — bento renders expected tiles; reveal ordering is deterministic and consistent across renders.
- **`TimelineSection`** — entries render in newest-first order; each entry is a separate panel; metadata fields (`commit`, `Author`, `Date`) are present; details render as bullet items, not paragraphs.
- **`ContactSection`** — CTA region and footer metadata render as separate regions.

### Prior art
Existing tests in `src/components/*.test.tsx` use Vitest + React Testing Library with fake timers (`vi.useFakeTimers`). New tests follow the same pattern. Browser-level visual verification is required for stack transitions, Projects pacing, mobile behaviour, and viewport fit — jsdom cannot meaningfully validate scroll-driven motion.

---

## Out of Scope

- Replacing the graphite/orange/pixel/monospace brand identity.
- Replacing the v4 notched project card direction with plain rows.
- Timeline horizontal scrolling (explicitly replaced by vertical stacked panels).
- Removing the Timeline metadata concept.
- Randomised Skills reveal (explicitly replaced by deterministic ordering).
- Mobile simplified/fade-only fallback for stacking — mobile gets the full effect.
- Reduced-motion fallback — not required in this pass.
- Adding project detail pages or routing.
- Adding a CMS or external content source.
- Adding a contact form backend.
- Reworking the loading screen unless necessary for layout integration.
- Inventing new portfolio content that is not present in or directly supported by `public/resume.pdf`.
- Accessibility audit (ARIA roles, keyboard navigation).
- Performance optimisation (code splitting, image optimisation).

---

## Further Notes

- `ideas/Portfolio v4.html` is the visual reference, not production architecture. Two behaviors from v4 are explicitly overridden: horizontal Timeline scroll and randomised Skills reveal.
- `public/resume.pdf` is the content reference. Do not copy demo names, project copy, skill lists, dates, roles, or timeline details from the v4 HTML when they conflict with the resume.
- Screenshot notes from `2026-05-17 18-56-08` and `2026-05-17 19-00-10` are explicit acceptance references for the Hero `// PORTFOLIO_INIT` spacing/underline bug and Timeline `// EXPERIENCE` / `// EDUCATION` slash typography.
- The loading screen runs for 2.8 s; the hero intro waits 3.2 s before starting, giving the loading screen time to fully exit. Both timings are intentional.
- The highest-risk implementation detail is combining outer stacked sections with the inner Projects carousel. Those two motion systems must be clearly separated — the outer layer is stable while the carousel is active.
- The v4 HTML ships all components in a single Babel script block. The React codebase splits these into individual `.tsx` files per component — that structure is preserved.
- Scroll-snap anchors (`scroll-snap-type: y proximity` on `html`, phantom `snap-anchor` divs) may still be used to enforce hard stops inside the Projects carousel. They must co-exist cleanly with the dead-zone buffer logic.
