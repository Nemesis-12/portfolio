# Requirements: Portfolio Website

**Defined:** 2025-05-14
**Core Value:** A public-facing portfolio that reflects my identity as a CS student/developer and gives visitors a clear path to reach me.

## v1 Requirements

### Loading Screen

- [ ] **LOAD-01**: Loading screen appears on every visit as full-page overlay
- [ ] **LOAD-02**: Shows "SYSTEM_INIT..." label, name in pixel font, progress bar
- [ ] **LOAD-03**: Progress bar has orange fill (#FF8547)
- [ ] **LOAD-04**: Cycles through status messages: ESTABLISHING_SIGNAL → COMPILING_MODULES → LOADING_ASSETS → SYSTEM_READY
- [ ] **LOAD-05**: Fades out via Framer Motion when complete, reveals main content

### Navigation

- [ ] **NAV-01**: Sticky navbar at top, transparent over hero
- [ ] **NAV-02**: Logo "FM_" in pixel font, links to top
- [ ] **NAV-03**: Links: HERO, PROJECTS, SKILLS, TIMELINE, CONTACT with smooth-scroll
- [ ] **NAV-04**: Active section highlighted with orange underline (IntersectionObserver)
- [ ] **NAV-05**: Mobile: hamburger icon below md breakpoint
- [ ] **NAV-06**: MobileMenu fullscreen overlay, closes on link tap

### Hero Section

- [ ] **HERO-01**: Dot-grid background pattern (CSS radial-gradient or SVG)
- [ ] **HERO-02**: "// PORTFOLIO_INIT" label in accent orange
- [ ] **HERO-03**: Name in large pixel font (Press Start 2P), black
- [ ] **HERO-04**: Subtitle "CS_STUDENT · DEVELOPER" in monospace, graphite color
- [ ] **HERO-05**: "VIEW_WORK →" CTA that smooth-scrolls to Projects

### Projects Section

- [ ] **PROJ-01**: Renders from src/data/projects.ts (typed data file)
- [ ] **PROJ-02**: Accordion layout - one item open at a time
- [ ] **PROJ-03**: All projects collapsed by default
- [ ] **PROJ-04**: Each row shows: index (_01), project name, tech stack tags, expand arrow
- [ ] **PROJ-05**: Clicking second project collapses first and expands second
- [ ] **PROJ-06**: Expanded row shows: project image, description paragraph
- [ ] **PROJ-07**: Expansion animated via Framer Motion layout animation

### Skills Section

- [ ] **SKILL-01**: Bento grid layout with asymmetric proportions
- [ ] **SKILL-02**: Each tile shows: category label (LANGUAGE, FRAMEWORK, TO) + skill name
- [ ] **SKILL-03**: Tile colors from brand palette (orange, purple, fuchsia, yellow, dark)
- [ ] **SKILL-04**: Mobile: compact asymmetric bento reflow (2-3 column grid)

### Timeline Section

- [ ] **TIME-01**: Chronological entries: education, internships, hackathons, TA role
- [ ] **TIME-02**: Each entry: date range (left column, orange), institution (orange), role (pixel font), description (monospace)
- [ ] **TIME-03**: Horizontal rule separates entries

### Contact Section

- [ ] **CONT-01**: "// 04 CONTACT" section label
- [ ] **CONT-02**: "LET'S CONNECT." in large pixel font
- [ ] **CONT-03**: "SEND_MESSAGE →" as mailto link, styled as button
- [ ] **CONT-04**: Footer links: GITHUB, LINKEDIN, EMAIL, RESUME
- [ ] **CONT-05**: Resume opens in new tab (target="_blank")
- [ ] **CONT-06**: Resume PDF from public/resume.pdf

### Animations

- [ ] **ANIM-01**: Scroll-triggered fade-up on every section (whileInView, once: true)
- [ ] **ANIM-02**: Hover ease-in/out on interactive elements (hoverEase variant)
- [ ] **ANIM-03**: Shared Framer Motion variants from single module

### Mobile Responsiveness

- [ ] **MOB-01**: Entire site mobile-responsive (below md breakpoint)
- [ ] **MOB-02**: Navbar collapses to hamburger below md
- [ ] **MOB-03**: Bento grid switches layout at md breakpoint
- [ ] **MOB-04**: Hero font scales down on small screens

## v2 Requirements

None currently - all critical features in v1.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dark mode | Deferred to future iteration |
| Contact form with real email | No server-side, keep v1 simple |
| CMS/headless content management | Not needed for static portfolio |
| Blog or writing section | Not in PRD |
| Project detail pages / routing | Single page SPA per PRD |
| Analytics/tracking | Not in PRD |
| SEO meta tags / Open Graph | Can be added later |
| Internationalisation | Not in PRD |
| WCAG accessibility audit | Not explicitly required for v1 |

## Traceability

| Requirement | Phase | Status |
| ----------- | ----- | ------ |
| LOAD-01 to LOAD-05 | TBD | Pending |
| NAV-01 to NAV-06 | TBD | Pending |
| HERO-01 to HERO-05 | TBD | Pending |
| PROJ-01 to PROJ-07 | TBD | Pending |
| SKILL-01 to SKILL-04 | TBD | Pending |
| TIME-01 to TIME-03 | TBD | Pending |
| CONT-01 to CONT-06 | TBD | Pending |
| ANIM-01 to ANIM-03 | TBD | Pending |
| MOB-01 to MOB-04 | TBD | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 0
- Unmapped: 40 ⚠️ (need roadmap)

---
*Requirements defined: 2025-05-14*
*Last updated: 2025-05-14 after project initialization*