# Desktop v4 QA Closeout — Issue #164

**Branch audited:** `mochi/issue-164-qa-desktop-v4-gate` @ `a7a4125`  
**QA date:** 2026-05-21  
**Reference materials:** `ideas/Portfolio.html` (repo-local, gitignored; issue #164 labels this `Portfolio v4.html`), screenshots in `ideas/`  
**Live app:** `npm run build && npm run preview` @ `http://127.0.0.1:4173/` (1440×900 desktop viewport)  
**Automated gate:** `npm run typecheck && npm run test` — **364/364 passed**

> **Verification only.** No fixes were implemented in this pass. Visible mismatches are tracked as follow-up GitHub issues below.

---

## Executive verdict

The desktop site **partially matches** the v4 reference mental model. Core mechanics for Projects carousel behavior, Skills bento layout, Timeline typewriter persistence, and Contact CTA composition are largely in place and covered by tests. **Three visual/behavior gaps** block a full “match” verdict against the reference screenshots/HTML: Timeline section chrome (header + scroll hint), Projects header typography/classes, and Navbar active-link caret treatment.

Content divergences from reference screenshots (2 projects vs 6, 3 timeline entries vs 5, resume-backed skills tiles) are **expected** per issue #164’s resume.pdf constraint and are documented—not filed as defects.

---

## Methodology

1. Read reference HTML (`ideas/Portfolio.html`) and all six screenshots.
2. Reviewed existing Vitest coverage (20 files, 364 tests) against PRD acceptance criteria.
3. Ran production preview in browser at 1440×900; scrolled through Hero → Projects → Skills → Timeline → Contact.
4. Compared DOM/CSS contracts and scroll-hook math against reference behavior notes.

**Note:** Reference files live in the parent repo’s gitignored `ideas/` folder; they are not committed to this worktree. QA used `/mnt/drived/Personal/Programming/PyProjects/PyML/portfolio/ideas/`.

---

## Section-by-section results

### Hero — `ideas/home.png`

| Check | Verdict | Notes |
|-------|---------|-------|
| Full-viewport sticky section | ✅ Match | `StickySection` + `hero-inner` 5vw padding |
| `// PORTFOLIO_INIT` + orange bar | ✅ Match | `hero-init`, `hero-bar` present |
| Two-line pixel name (`hero-name-line`) | ✅ Match | Press Start 2P via `hero-name` |
| Typewriter sequence (name → role → value prop → CTAs) | ✅ Match | CTAs render after animation (`VIEW_WORK`, `VIEW_RESUME`) |
| Line grid background | ✅ Match | `hero-grid` (not dot grid) |
| Rotating role line | ⚠️ Content | First role is `CS_STUDENT` (constants), reference screenshot shows `BUILDER` — intentional rotation order |
| CTA button styling | ✅ Match | `btn btn-fill` / `btn btn-outline`, sharp edges |

**Hero verdict:** **Match** (visual design). Role label differs from static screenshot due to rotation cycle.

---

### Projects — `ideas/proj.png` + HTML behavior

| Check | Verdict | Notes |
|-------|---------|-------|
| Scroll range `(n×1.5+1)×100vh` | ✅ Match | Verified in tests + live DOM |
| Entry/exit dead zones (~25vh) | ✅ Match | `DEAD_ZONE_VIEWPORT_RATIO = 0.25`, `applyDeadZones()` |
| Active card centering | ✅ Match | `proj-edge` spacers + translateX hook |
| Neighbor model (scale/opacity) | ✅ Match | 0.92/0.6 neighbors, 0.85/0.25 far — visible in browser |
| Progress counter + bar | ✅ Match | `01 / 02` at start; fill tracks scroll progress |
| Scroll hint `SCROLL →` | ✅ Match | Fades when `progress > 0` |
| Notched cards (`pcard`, clip-path) | ✅ Match | Notch markers + ghost number |
| Hover/focus diagonal fill | ✅ Match | `pcard-fill` mask; platinum invert on content |
| Section header typography | ❌ Mismatch | Uses Tailwind `text-xs` approximations instead of `hscroll-head` / `hscroll-no` / `hscroll-name` / `hscroll-progress` classes — smaller/wrong colors vs reference |
| Project count | ⚠️ Content | 2 resume-backed projects vs 6 in reference screenshot — expected per resume audit |

**Projects verdict:** **Behavior match**, **header visual mismatch** (follow-up issue filed).

---

### Skills — `ideas/skills.png`

| Check | Verdict | Notes |
|-------|---------|-------|
| `// 02 SKILLS` header row | ✅ Match | Uses portfolio `hscroll-head` classes |
| Six-column bento grid | ✅ Match | `bento` + `bi bi-{area}` grid-template-areas |
| Sharp rectangular tiles | ✅ Match | No border-radius on tiles |
| Palette swatch tile | ✅ Match | `bi-pal` with four swatches |
| Deterministic reveal order | ✅ Match | `REVEAL_ORDER` tested for determinism |
| Tile names/categories | ⚠️ Content | Resume-backed skills (Python, FastAPI, PyTorch…) differ from reference demo tiles (React, Node.js, PostgreSQL…) — expected |

**Skills verdict:** **Layout match**, content intentionally resume-backed.

---

### Timeline — `ideas/timeline.png`, `ideas/timeline 2.png`, HTML behavior

| Check | Verdict | Notes |
|-------|---------|-------|
| Newest-first sticky panels | ✅ Match | NetApp → M.S. → B.S. DOM order |
| Active panel detection | ✅ Match | `useActivePanel` scroll hook |
| Typewriter persistence | ✅ Match | Partial text held on deactivate; resumes on reactivate (tests #159) |
| Structured content hierarchy | ✅ Match | `tl-commit` → `tl-org` → `tl-title` → `tl-bullets` |
| Section-type labels (`// EXPERIENCE` / `// EDUCATION`) | ✅ Match | Separate `tl-section-slash` + `tl-section-kind` |
| `// 03 TIMELINE` header + progress | ❌ Mismatch | Not implemented; reference shows `01 / 05` counter + orange bar |
| `SCROLL ↓` hint | ❌ Mismatch | Not present on timeline panels |
| Entry count | ⚠️ Content | 3 resume entries vs 5 in reference — expected per resume audit |
| Horizontal slide model | ⚠️ Architecture | Reference HTML uses horizontal track + snap; app uses vertical sticky stack (accepted in #157 tests) |

**Timeline verdict:** **Core panel behavior match**, **section chrome mismatch** (follow-up issue filed).

---

### Contact / CTA — `ideas/cta.png`

| Check | Verdict | Notes |
|-------|---------|-------|
| `LET'S` / `CONNECT.` pixel heading | ✅ Match | `footer-big` + typewriter sequence |
| Orange period + blinking cursor | ✅ Match | `.period` + `.cursor` |
| Centered `SEND_MESSAGE →` button | ✅ Match | `btn btn-fill` |
| Social links with `//` prefix | ✅ Match | `slink::before` content |
| Footer metadata row | ✅ Match | `FARHAN_MOHAMMED © 2026` / `PORTFOLIO.EXE` |

**Contact verdict:** **Match**.

---

## Navbar (cross-cutting)

| Check | Verdict | Notes |
|-------|---------|-------|
| Fixed translucent bar, `FM_` logo | ✅ Match | `.nav` classes |
| Active orange label + underline | ✅ Match | Scoped to `.nav-label::after` |
| `>` caret on active link | ❌ Mismatch | React removes caret DOM when active; reference HTML/CSS and all screenshots show `> LABEL` on the active section |

**Navbar verdict:** **Mismatch** on active caret (follow-up issue filed).

---

## Test coverage audit

Existing tests align well with PRD testing decisions:

- **Hero:** `hero-name-line`, `hero-init`, `hero-bar` — covered
- **Projects:** progress indicator, scroll hint, ghost numbers, `ptag`, hover/focus fill — extensively covered (80+ cases)
- **Skills:** reveal delay determinism — covered
- **Timeline:** slash/kind siblings, `tl-org`, typewriter persistence, structured fields — covered
- **Contact:** `footer-big`, `slink` — covered
- **Scroll hooks:** dead zones, carousel translate — covered

Gaps tests intentionally do not cover (per PRD): pixel-perfect font sizes, screenshot parity, Timeline section header chrome.

---

## Content divergences (documented, not defects)

Per issue #164, `public/resume.pdf` is the content source of truth. Reference HTML/screenshots use demo placeholder content.

| Area | Reference | Live app | Status |
|------|-----------|----------|--------|
| Projects | 6 cards | 2 (LEVIATHAN, MLA_IMPL) | Resume-backed ✅ |
| Timeline | 5 entries incl. hackathon/intern | 3 (NetApp + 2× WSU) | Resume-backed ✅ |
| Skills tiles | React, Node.js, PostgreSQL, Figma… | Python, FastAPI, PyTorch… | Resume-backed ✅ |
| M.S. bullets | 3 bullets in reference screenshot | Empty bullets array | Resume gap — no invented content |

---

## Follow-up issues created

| Issue | Title | Severity |
|-------|-------|----------|
| [#206](https://github.com/Nemesis-12/portfolio/issues/206) | Timeline: add `// 03 TIMELINE` header, entry progress counter, and `SCROLL ↓` hint | Visual/behavior |
| [#207](https://github.com/Nemesis-12/portfolio/issues/207) | Projects: use portfolio `hscroll-*` header classes instead of Tailwind approximations | Visual |
| [#208](https://github.com/Nemesis-12/portfolio/issues/208) | Navbar: show `>` caret on active nav link per reference HTML/screenshots | Visual |

---

## Gate decision

**Desktop v4 gate: FAIL (conditional pass on mechanics, fail on section chrome parity)**

The site is ready for responsive work only after the three follow-up issues above are resolved. Carousel geometry, card interactions, bento layout, typewriter persistence, and contact CTA meet the intended mental model. Timeline and Projects section headers, plus navbar active caret, remain visibly off-reference.

---

## Commands run

```bash
npm run typecheck   # pass
npm run test        # 364/364 pass
npm run build       # pass
npm run preview -- --host 127.0.0.1 --port 4173
```
