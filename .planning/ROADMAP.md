# Roadmap: Portfolio Website

**Phases:** 4 | **Requirements:** 40 (40 active) | **Mode:** YOLO

## Phase Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Hero Section | Complete hero with terminal aesthetic | HERO-01 to HERO-05 | 5 |
| 2 | Projects Section | Accordion with typed data | PROJ-01 to PROJ-07 | 7 |
| 3 | Timeline Section | Chronological career display | TIME-01 to TIME-03 | 3 |
| 4 | Polish & Mobile | Responsive fixes, animations, status cycling | LOAD-04, NAV-04, SKILL-04, ANIM-01 to ANIM-03, MOB-01 to MOB-04 | 11 |

## Phase Details

### Phase 1: Hero Section

**Goal:** Complete hero section with terminal/hacker aesthetic

**Requirements:**
- HERO-01: Dot-grid background pattern
- HERO-02: "// PORTFOLIO_INIT" label in accent orange
- HERO-03: Name in large pixel font (Press Start 2P), black
- HERO-04: Subtitle "CS_STUDENT · DEVELOPER" in monospace
- HERO-05: "VIEW_WORK →" CTA that smooth-scrolls to Projects

**Success Criteria:**
1. Dot-grid background visible on hero section
2. Portfolio init label shows in orange accent color
3. Name displays in pixel font at appropriate size
4. Subtitle shows with monospace font
5. CTA button links to projects section

---

### Phase 2: Projects Section

**Goal:** Implement projects accordion with typed data file

**Requirements:**
- PROJ-01: Create src/data/projects.ts with typed Project interface
- PROJ-02: Accordion layout - one item open at a time
- PROJ-03: All projects collapsed by default
- PROJ-04: Each row shows: index (_01), project name, tech stack tags, expand arrow
- PROJ-05: Clicking second project collapses first and expands second
- PROJ-06: Expanded row shows: project image, description paragraph
- PROJ-07: Expansion animated via Framer Motion layout animation

**Success Criteria:**
1. projects.ts data file exists with at least 3 sample projects
2. Project interface matches PRD: id, title, description, tags, image?
3. Clicking a project expands it showing content
4. Only one project expanded at a time
5. Clicking expanded project collapses it
6. Clicking new project switches expansion
7. Animation smooth on expand/collapse

---

### Phase 3: Timeline Section

**Goal:** Display chronological career timeline

**Requirements:**
- TIME-01: Chronological entries: education, internships, hackathons, TA role
- TIME-02: Each entry: date range (left column, orange), institution (orange), role (pixel font), description (monospace)
- TIME-03: Horizontal rule separates entries

**Success Criteria:**
1. Timeline shows at least 4 entries (education, internship, hackathon, TA)
2. Date ranges display in orange on left
3. Institution names show in orange
4. Role titles use pixel font
5. Descriptions use monospace font
6. Horizontal rules between entries
7. Section has "// 03 TIMELINE" label

---

### Phase 4: Polish & Mobile

**Goal:** Mobile responsiveness, finishing touches, full animations

**Requirements:**
- LOAD-04: Loading screen status cycling (ESTABLISHING_SIGNAL → COMPILING_MODULES → LOADING_ASSETS → SYSTEM_READY)
- NAV-04: Active section highlighted with orange underline (IntersectionObserver)
- SKILL-04: Mobile bento grid reflow (2-3 column, varying row spans)
- ANIM-01: Scroll-triggered fade-up on every section (whileInView, once: true)
- ANIM-02: Hover ease-in/out on interactive elements
- ANIM-03: Shared Framer Motion variants from single module
- MOB-01: Entire site mobile-responsive below md breakpoint
- MOB-02: Navbar collapses to hamburger below md
- MOB-03: Bento grid switches layout at md breakpoint
- MOB-04: Hero font scales down on small screens

**Success Criteria:**
1. Loading screen cycles through all 4 status messages
2. Navbar shows active section underline on scroll
3. Skills bento grid reflows properly on mobile
4. All sections have fade-up animation on scroll
5. Hover effects work on interactive elements
6. Site is usable on mobile viewport
7. Hamburger menu works below md breakpoint
8. Font sizes adjust for small screens

---

## Requirements Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LOAD-01 | - | ✓ Validated |
| LOAD-02 | - | ✓ Validated |
| LOAD-03 | - | ✓ Validated |
| LOAD-04 | Phase 4 | Pending |
| LOAD-05 | - | ✓ Validated |
| NAV-01 | - | ✓ Validated |
| NAV-02 | - | ✓ Validated |
| NAV-03 | - | ✓ Validated |
| NAV-04 | Phase 4 | Pending |
| NAV-05 | - | ✓ Validated |
| NAV-06 | - | ✓ Validated |
| HERO-01 | Phase 1 | Pending |
| HERO-02 | Phase 1 | Pending |
| HERO-03 | Phase 1 | Pending |
| HERO-04 | Phase 1 | Pending |
| HERO-05 | Phase 1 | Pending |
| PROJ-01 | Phase 2 | Pending |
| PROJ-02 | Phase 2 | Pending |
| PROJ-03 | Phase 2 | Pending |
| PROJ-04 | Phase 2 | Pending |
| PROJ-05 | Phase 2 | Pending |
| PROJ-06 | Phase 2 | Pending |
| PROJ-07 | Phase 2 | Pending |
| SKILL-01 | - | ✓ Validated |
| SKILL-02 | - | ✓ Validated |
| SKILL-03 | - | ✓ Validated |
| SKILL-04 | Phase 4 | Pending |
| TIME-01 | Phase 3 | Pending |
| TIME-02 | Phase 3 | Pending |
| TIME-03 | Phase 3 | Pending |
| CONT-01 | - | ✓ Validated |
| CONT-02 | - | ✓ Validated |
| CONT-03 | - | ✓ Validated |
| CONT-04 | - | ✓ Validated |
| CONT-05 | - | ✓ Validated |
| CONT-06 | - | ✓ Validated |
| ANIM-01 | Phase 4 | Pending |
| ANIM-02 | Phase 4 | Pending |
| ANIM-03 | - | ✓ Validated |
| MOB-01 | Phase 4 | Pending |
| MOB-02 | Phase 4 | Pending |
| MOB-03 | Phase 4 | Pending |
| MOB-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Validated (already built): 18
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Roadmap created: 2025-05-14*
*Phases: 4 | Granularity: Coarse*