## Problem Statement

The current portfolio site presents Farhan's work as a conventional résumé in a browser: a graphite/orange theme, a list of skills, a git-log-styled timeline, and project cards. It says what he has done, but it does not *show* the thing he actually does — model internals, efficient inference, and systems work under constraint. A visitor learns the facts and forgets them.

A new design exists as a bundled Claude artifact at `ideas/Portfolio.html`. It makes a different argument: the page itself is a demonstration. The hero replays AlphaGo vs. Lee Sedol Game 4 stone by stone, highlighting move 78 — the move a human used to beat the machine. The featured project animates its own inference pipeline (position → tokens → attention → policy → move) as the visual argument for a searchless engine. Skills appear as a connected graph with hover notes rather than the skill-bar cliché that pretends "Python 87%" means something.

That design cannot ship as-is. It is not HTML and CSS — it is a Claude artifact bundle whose payload is a `x-dc` template driven by a `DCLogic` runtime class, with `{{ }}` bindings, `sc-for`/`sc-if` directives, ~400 inline `style` attributes, a non-standard `style-hover` attribute, and imperative DOM mutation (`document.querySelector('[data-board]')`, `host.innerHTML = ''`) for the board animations. It also carries defects: it plays a partly fabricated Go game (79 real coordinates, ~71 procedurally generated), it has effectively no mobile design, it uses a `zoom`-based measuring loop to force content into the viewport, its skills graph is unreachable without a mouse, and its reduced-motion handling makes the board *worse* rather than calmer.

## Solution

Rewrite the portfolio from scratch in the existing stack (React 19 + TypeScript + Vite + Tailwind v4) to match the new design as closely as possible, fixing the defects rather than porting them.

The visitor gets a six-section page where each section fills exactly one viewport above 880px, five switchable colour themes that persist across visits, a Go board that replays all 180 real moves of Game 4 with captures animating correctly, an animated inference pipeline for the featured project, an interactive skills graph that works with a mouse, a finger, or a keyboard, and a genuine mobile experience. Everything factual on the page is traceable to the résumé.

Only `public/resume.pdf` survives from the current site. All existing components, tests, and stylesheets are deleted.

## User Stories

### Navigation and shell

1. As a visitor, I want the page to render immediately on load, so that I see the Go board start rather than a loading gate.
2. As a visitor, I want a fixed header with the site mark, section links, a theme control, and a live clock, so that I always know where I am and what I can do.
3. As a visitor, I want a thin progress bar under the header that tracks how far I have scrolled, so that I know how much of the page remains.
4. As a visitor, I want nav links for Projects, Skills, Education & Experience, and Contact, so that I can jump straight to what I came for.
5. As a visitor, I want clicking a nav link to scroll smoothly to that section, so that I keep my sense of place.
6. As a visitor on a phone, I want a hamburger button instead of four cramped links, so that the header is usable at 375px.
7. As a visitor on a phone, I want the hamburger to open a full-screen menu that closes when I pick a destination, so that navigation is a single gesture.
8. As a keyboard user, I want a skip link as the first focusable element, so that I can reach the content without tabbing through the whole header.
9. As a visitor, I want each section to occupy exactly one viewport on a laptop or desktop, so that the page reads as a sequence of complete screens rather than a scroll of fragments.
10. As a visitor on a phone, I want sections to stack and scroll normally, so that content is never shrunk to illegibility to force a fit.
11. As a visitor, I want scroll snapping between sections, so that scrolling settles on whole screens.

### Theming

12. As a visitor, I want a theme control in the header showing the active theme's name and a three-colour swatch, so that I can tell at a glance what is selected.
13. As a visitor, I want to open the theme control and see all five themes with their own swatches, so that I can preview before committing.
14. As a visitor, I want picking a theme to recolour the entire page immediately, so that the change feels direct.
15. As a returning visitor, I want my theme choice remembered, so that I do not reselect it every visit.
16. As a returning visitor, I want my saved theme applied before the first paint, so that I never see the default theme flash first.
17. As a keyboard user, I want the theme menu to close on Escape and return focus to its trigger, so that I am not trapped.
18. As a visitor, I want clicking outside the theme menu to close it, so that it behaves like every other menu.
19. As a screen reader user, I want the theme control to announce itself as an expandable menu and report its state, so that I know what it is.

### Hero and the Go board

20. As a visitor, I want the hero to state the role, the name, and a short tagline that types itself out, so that I know who this is within two seconds.
21. As a visitor, I want a 19×19 Go board replaying AlphaGo vs. Lee Sedol Game 4, so that the page opens with something worth watching.
22. As a visitor, I want the board to play the real 180 moves of that game, so that the caption "GAME 4 · 2016 · WHITE WINS BY RESIGNATION" is true of what I am looking at.
23. As a visitor, I want captured stones to disappear when they are captured, so that the position on screen is the position that was actually played.
24. As a visitor, I want captures to animate out rather than vanish abruptly, so that the most dramatic moments of the game read as dramatic.
25. As a visitor, I want move 78 rendered larger and in the accent colour after a deliberate pause, so that the one move the whole game turns on is unmissable.
26. As a visitor, I want the opening moves placed slowly and the later moves quickly, so that the sequence has rhythm and still completes in about thirty seconds.
27. As a visitor, I want individual stones to fade and scale in smoothly even when placement is fast, so that a quick sequence never looks like flickering.
28. As a visitor, I want the current move number and the player names displayed alongside the board, so that I can follow the game.
29. As a visitor, I want the game to loop after a pause at the final position, so that the hero is alive whenever I return to the top.
30. As a visitor who has disabled animations, I want the finished board drawn statically with move 78 highlighted, so that I get the same information with no motion at all.

### Projects

31. As a visitor, I want a featured project section devoted to Leviathan, so that the strongest work gets a full screen.
32. As a visitor, I want a one-line hook for Leviathan before any detail, so that I grasp the idea before the specifics.
33. As a visitor, I want three supporting bullets covering the memory, tokenizer, and training decisions, so that I can judge the engineering.
34. As a visitor, I want headline statistics — latency per move, parameter count, positions trained — counting up when the section comes into view, so that the numbers register.
35. As a visitor, I want links to the source and the live demo, so that I can verify the claims myself.
36. As a visitor, I want an animated panel showing position → tokens → attention → policy → move, so that I can see what "it never searches" actually means.
37. As a visitor, I want the pipeline to loop continuously, so that it is running whenever I arrive at the section.
38. As a visitor, I want a second projects screen covering the other work, so that the featured project is not diluted.
39. As a visitor, I want the second screen to read as a continuation rather than a repeat of the first, so that I do not think the page has glitched.
40. As a visitor, I want the MLA library presented with its install command, so that I can use it in one step.
41. As a visitor, I want the in-progress thesis shown with a running indicator and its defence date, so that I know what is current.
42. As a visitor, I want the thesis illustrated by a cluster of agent dots, so that the premise is legible without a paragraph.

### Skills

43. As a visitor, I want skills shown as a connected graph with four hubs, so that I see how the areas relate instead of reading a list.
44. As a visitor, I want each hub colour-coded by group, so that I can scan by area.
45. As a visitor, I want hovering a node to reveal a one-line note about how that skill is actually used, so that the graph carries real information.
46. As a visitor on a phone, I want tapping a node to reveal its note, so that the section is not twenty-three unexplained dots.
47. As a visitor on a phone, I want tapping elsewhere to dismiss the note, so that I can move on.
48. As a keyboard user, I want to tab between nodes and see each note on focus, so that the section is fully reachable without a pointer.
49. As a screen reader user, I want each node to be a real button with an accessible name, so that the graph is navigable.
50. As a visitor, I want edges drawn between hubs and their members, so that the structure is visible at a glance.

### Education and experience

51. As a visitor, I want education and experience side by side on one screen, so that I can see the whole trajectory at once.
52. As a visitor, I want each entry to show its status, date range, title, and a short qualifier, so that I can scan without reading.
53. As a visitor, I want current entries marked distinctly from finished ones, so that I know what is live.
54. As a visitor, I want two or three supporting bullets per entry, so that I get substance without a wall of text.
55. As a visitor on a phone, I want the entries to stack in a single readable column, so that nothing is cramped.
56. As the site owner, I want every date, title, GPA, and honour to match the résumé exactly, so that nothing on the site contradicts the PDF a recruiter downloads.

### Contact

57. As a visitor, I want a closing statement of what work is being sought, so that I know whether to get in touch.
58. As a visitor, I want direct links to email, GitHub, LinkedIn, and the résumé, so that I can act immediately.
59. As a visitor, I want each link labelled with what it actually is, so that I pick the right one first time.
60. As a visitor, I want the résumé link to open the PDF that is the source of truth for the rest of the page, so that the two never disagree.

### Cross-cutting

61. As a visitor who has disabled animations, I want the clock, the blinking cursor, and the pipeline loop to settle rather than flicker, so that the page is calm.
62. As a visitor on a slow connection, I want fonts to load without a late reflow, so that the layout does not jump after I have started reading.
63. As the site owner, I want analytics and speed insights to keep working, so that I retain the measurement I already have.
64. As the site owner, I want all page content to live in data modules rather than inside render components, so that updating a fact is a one-file change.

## Implementation Decisions

### Scope

- Complete rewrite. Every existing component, hook, animation, stylesheet, and test is deleted. `public/resume.pdf` is the only artefact that survives.
- `ideas/Portfolio.html` is a Claude artifact bundle, not a page. Its payload was decoded (gzip + base64 manifest) into a `x-dc` template plus a `DCLogic` class. The template is the design reference; the class is behavioural reference only. Neither is ported literally.
- The `.mochi/` directory is deleted along with its `.md` workflow files. The unmerged branch `mochi/code-quality-cleanup` and its worktree are dropped — it refactors code this rewrite deletes.
- Agent worktrees reuse the existing `.claude/worktrees/` location.

### Styling architecture

- Tailwind v4 is the primary styling mechanism. Plain `.css` files are used where Tailwind is awkward — keyframes, complex selectors, the theme blocks themselves.
- shadcn/ui is not adopted. The design needs roughly two primitives it could supply, against the cost of Radix defaults that fight a pixel-font brutalist aesthetic. The `@/*` path alias and a `cn()` helper are set up anyway so shadcn is a one-command addition later.
- The `@/*` alias must be declared in both the TypeScript config and the Vite config.
- `"strict": true` is added to the app TypeScript config as part of the foundation work. It is currently absent.

### Theming

- Five themes: ORIGINAL, TERRACOTTA, INDIGO, PURPLE, OLIVE. Each defines fourteen colour tokens.
- Themes are selected by a `data-theme` attribute on the document root, with one CSS block per theme. This replaces the reference implementation's approach of setting fourteen custom properties imperatively from JavaScript on every switch.

  *Rationale:* adding a theme becomes one CSS block with no JavaScript change; themes cannot drift out of sync with a JavaScript object; the switcher reduces to a single attribute write; and the assertion in tests is one string rather than fourteen inline properties.

- Tailwind's theme layer references the swappable custom properties indirectly, so utilities resolve live rather than compiling to literal hex values.
- Colour values are stored as space-separated channels so Tailwind opacity modifiers work.
- The selected theme persists in `localStorage` and is applied by a small inline script in the HTML shell **before** the app mounts, preventing a flash of the default theme.
- A small theme data module holds each theme's id, display name, and three swatch colours — for rendering the picker only. The full token sets live in CSS.

### Layout and viewport fit

- Above 880px, every section occupies exactly one viewport. Below 880px, sections release their fixed height and stack.
- Fit is achieved by **viewport-proportional CSS units** — every font size, gap, and padding derived from viewport-relative units and `clamp()`, so content is proportional to the viewport by construction.
- The reference implementation's `fitAll()` measuring loop is **not** ported. That routine set `element.style.zoom` in up to three passes down to a floor of 0.6, rerunning on resize and at fixed delays. It breaks fixed-position children, produces fractional text sizes (worst case for a pixel font), and costs three synchronous layout passes per section per resize.
- A coherent fluid type scale is designed once and applied across all sections rather than scattering ad-hoc `clamp()` values.
- Viewport fit cannot be verified in jsdom. It is checked manually. Browser-based verification is deliberately deferred.

### Sections

- Six sections: hero, projects (featured), projects (other), skills, education & experience, contact.
- The navigation lists four destinations. The hero and the second projects screen are reachable by scrolling only.
- **Defect fixed:** the reference marks the second projects screen with the same `01 PROJECTS` eyebrow as the first, so two consecutive full-viewport screens carry an identical heading and read as a rendering bug. The duplicate number is dropped; the second screen keeps its distinguishing subtitle and reads as a continuation.

### Content and copy

- The reference's copy voice is adopted: short declaratives, dry humour, no résumé-speak. Individual lines are revisable.
- **The résumé PDF is the source of truth for every fact.** Where the reference's copy and the résumé disagree, the résumé wins.
- **Defect fixed:** the reference advertises `pip install mla-pytorch`. The real package is `multihead-latent-attention`.
- All content lives in data modules. Components are pure presentation. This boundary is enforced by an architecture test.

### The Go board

- The board replays the real AlphaGo vs. Lee Sedol Game 4, played 2016-03-13.
- **Defect fixed:** the reference hardcodes 79 real coordinates and procedurally generates the remaining ~71 with a seeded random walk that drops stones near recent ones, capped at 150. Moves 80 onward are decorative noise, and the board never reaches a position that was played.
- The source SGF is a Fan Hui commentary record. Its headers were verified: `DT[2016-03-13]`, `PW[Lee Sedol]`, `PB[AlphaGo]`, `RE[W+Resign]`, `SZ[19]`. Main-line extraction (taking the first child at each branch point, since analysis variations are embedded) yields exactly **180 moves**. Move 1 is `B[pd]`, confirming AlphaGo played Black and the reference's colour parity is correct. **Move 78 is `W[ki]`** — Lee's wedge at L11, the move the game turns on, correctly landing at the highlighted index.

  A separate SGF supplied earlier was Game 5 (`DT[2016-03-15]`, colours reversed, AlphaGo winning). It is not used.

- Conversion runs **once locally**, not in CI. The generated move array is committed as a data module; the SGF itself is committed for provenance so the record is auditable.
- **Capture rules are implemented.** A pure module takes the move list and produces the board state after each move, resolving captures by group liberty detection. Without this, playing 180 real moves append-only produces a position that never existed, with dead stones cluttering the exact region move 78 wins.
- Captures animate out. A group disappearing is the strongest motion available in the sequence and it is what move 78 earns.
- Move timing has a deliberate rhythm: slow through the opening, accelerating through the middlegame, a full pause before move 78, fast through the endgame, then a hold at the final position. Target loop length is about thirty seconds. Individual stone transitions stay long enough (~550ms) that fast placement still looks smooth — transitions overlap rather than shorten.
- The sequence loops indefinitely, fading out before replaying.
- Under reduced-motion preference, no sequence plays. The final position is rendered statically with move 78 highlighted.
- The reference drives the board by direct DOM mutation from outside any component model. The rewrite drives it from state, with pure frame-to-model functions supplying each frame.

### Other animated set-pieces

- The featured project's inference pipeline (position, tokens, attention grid, policy candidates, output move) loops on a frame counter.
- The skills graph renders nodes as absolutely-positioned buttons over an SVG edge layer.
- The thesis agent cluster animates.
- Each animated widget owns its own state and timer, scoped to the smallest component that needs it, so a frame tick re-renders a leaf rather than a section.
- Frame-to-model logic is extracted as pure functions, following the existing geometry-module pattern.
- The scroll progress bar is the one deliberate exception: it writes its width directly in a `requestAnimationFrame` callback, bypassing React, as scroll-linked updates should.

### The chess sequence

- **Cut.** The reference alternates the hero board between the Go game and a 33-move replay of Morphy's 1858 Opera Game. Only the Go sequence is kept.
- Note that the chess *position display* inside the Leviathan project panel is a different thing and is retained — it is the engine's own input.

### Features cut from the current site

- The loading screen. First paint should be the Go board starting; a 2.4-second gate delays the best thing on the page. Font preloading covers the flash it was hiding.
- Parallax layers. Nothing in the new design uses them.
- Horizontal project scrolling and sticky-section scroll hosts. The new design is vertical snap only.
- The rotating role typewriter, replaced by a single one-shot tagline typer.

### Features retained

- A mobile menu, rebuilt. The reference has no mobile navigation at all; four nav links plus a theme control do not fit at 375px.
- Vercel Analytics and Speed Insights.

### Typography

- IBM Plex Mono replaces Space Mono as the body face. Press Start 2P is retained for display.
- Fonts are **self-hosted**, not loaded from a CDN. Viewport-fit typography depends on metrics being stable at first paint; a late CDN swap after layout is precisely what breaks it.
- Weights shipped: IBM Plex Mono 400 and 500, Press Start 2P 400. Latin and Latin-Extended subsets only. The artifact bundle carried twenty-five font files including Cyrillic, Greek, and Vietnamese subsets; those are not shipped.
- Font files are preloaded.

### Accessibility and motion

- Reduced motion is handled per-widget rather than by the reference's blanket rule zeroing every duration to 0.001ms. Applied to the board, that rule does not stop the animation — it plays it instantly, flashing 180 stones onto the board at once, which is the opposite of the setting's intent.
- Skill nodes are real buttons: focusable, keyboard-operable, and tappable, with notes revealed on hover, focus, or tap.
- The theme menu supports Escape to close, click-outside to close, focus return to its trigger, and expanded-state announcement.
- A skip link is the first focusable element.

## Testing Decisions

### What makes a good test here

Tests verify behaviour through public interfaces. A test should survive any refactor that does not change what a visitor experiences. Concretely: no assertions on class names, no assertions on stylesheet text, no assertions on internal component state, and no frame-by-frame appearance checks.

The current suite is the counter-example and is being deleted: it carries roughly 3,900 of 6,381 lines across nine per-component seams, and includes tests (`index-css.test.ts`, `portfolio-css.test.ts`) that assert on raw CSS source text — which will be Tailwind-generated and meaningless after this rewrite.

Test volume is deliberately weighted, not uniform. Logic that can be silently wrong gets thorough tests; presentation gets smoke coverage.

### Seam 1 — the application root

All user-facing behaviour is tested by rendering the app and asserting observable outcomes. One seam, not nine.

Covers: all six sections present and correctly ordered; navigation targets resolve; theme selection changes the document theme attribute and persists; the saved theme is restored on reload; the theme menu closes on Escape and on outside click; the mobile menu appears below the breakpoint and closes on selection; reduced-motion preference yields a static final board rather than a sequence; skill node focus and tap reveal notes; the skip link is present and first in tab order.

Fake timers drive the board and pipeline sequences.

*Prior art:* `integration.smoke.test.ts`.

### Seam 2 — the Go engine

A pure module mapping a move list to the board state after each move, with captures resolved. No DOM, no React, no timers.

This is where correctness risk concentrates: group flood-fill, liberty counting, capture ordering, and self-capture edge cases are all easy to get subtly wrong and impossible to eyeball on a 19×19 board.

Tested against the real Game 4 sequence and against hand-built fixtures covering single-stone capture, multi-stone group capture, captures on the board edge, captures in a corner, and simultaneous adjacent captures.

*Prior art:* `projectsGeometry.ts` and `timelineGeometry.ts` — pure modules with headless tests, the established pattern in this repo.

### Seam 3 — data integrity

Pure imports of the data modules, asserting facts rather than rendering.

Covers: every date, title, GPA, and honour matches the résumé (a rewritten résumé audit); the committed Go game is well-formed — exactly 180 moves, strictly alternating colours, all coordinates within the 19×19 board, and move 78 is White at `ki`; and the data-versus-UI boundary holds, with canonical content living in data modules and not inside render components.

*Prior art:* `resume-audit.test.ts` and `architecture.test.ts`, both surviving in rewritten form.

### Deliberately untested

- CSS output and class names.
- Individual component internals.
- Animation appearance frame by frame.
- **Viewport fit.** "One section per viewport above 880px" is the headline layout requirement and jsdom has no layout engine, so it cannot be asserted at any seam. It is verified manually. Adding a browser-based check is a reasonable future addition and is out of scope here.

## Out of Scope

- Browser-based or visual regression testing. Viewport fit is verified by hand for now.
- Any content management system or runtime content editing. Content is committed data.
- Server-side rendering, routing, or multi-page structure. This remains a single scrolling page.
- Internationalisation. Latin subsets only.
- Reinstating the chess replay sequence.
- Porting the reference's `zoom`-based fit routine as a fallback.
- Adopting shadcn/ui components in this rewrite, though the groundwork is laid.
- Redesigning the résumé PDF itself.
- Changing the deployment target or CI configuration beyond what the rewrite requires.

## Further Notes

- `ideas/` is gitignored, so neither the reference artifact nor the SGF is currently in the repository. The SGF moves into a committed location as part of this work. The reference artifact remains local.
- The decoded reference template and its logic class are available locally and are the authoritative visual reference for spacing, colour token usage, and copy. They should be consulted rather than guessed at.
- `.mochi/CODING_STANDARDS.md` is being deleted with the rest of that directory. Most of its content described a different project entirely (Effect primitives, sandbox providers). Its testing principle — behaviour through public interfaces, not implementation details — is preserved in the testing decisions above.
- Three design areas are genuinely unspecified by the reference and need design work rather than transcription: the sub-880px mobile layout for all six sections, the fluid type scale, and the heading hierarchy of the second projects screen now that its duplicate number is removed. The desktop design is otherwise a faithful port.
- The board timing figures in this spec are a starting point, not a measured result. They will need tuning against the real animation.
