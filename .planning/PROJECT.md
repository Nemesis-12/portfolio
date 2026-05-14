# Portfolio Website — Farhan Mohammed

## What This Is

A single-page scrollable portfolio website with a terminal/hacker aesthetic — pixel fonts, monospace body text, dot-grid background, and branded loading screen. Features five sections: Hero, Projects, Skills, Timeline, and Contact. Built with Vite + React + TypeScript + Tailwind CSS, statically hosted on Vercel.

## Core Value

A public-facing presence that reflects my identity as a CS student and developer, communicates my technical depth, and gives visitors (recruiters, hiring managers, collaborators) a clear path to reach me.

## Requirements

### Validated

- ✓ LoadingScreen with animation - existing
- ✓ Navbar (sticky) - existing
- ✓ MobileMenu (fullscreen overlay) - existing
- ✓ SkillsSection (bento grid) - existing
- ✓ ContactSection with mailto + footer links - existing
- ✓ Animation variants system (Framer Motion) - existing

### Active

- [ ] HeroSection - name in pixel font, subtitle, VIEW_WORK CTA, dot-grid background
- [ ] ProjectsSection - accordion layout, project data file, single expansion
- [ ] TimelineSection - chronological education/internships/achievements
- [ ] Full scroll-triggered fade-up animations on all sections
- [ ] Mobile responsive bento grid for skills
- [ ] Loading screen status message cycling

### Out of Scope

- Dark mode - deferred to future
- Contact form with real email delivery
- CMS or headless content management
- Blog or writing section
- Project detail pages / routing
- Analytics or tracking
- SEO meta tags and Open Graph
- Internationalisation
- WCAG accessibility audit

## Context

**Existing codebase state:**
- React 19 + TypeScript + Vite + Tailwind CSS setup complete
- Component structure: App, LoadingScreen, Navbar, MobileMenu, SkillsSection, ContactSection
- Animation system with shared Framer Motion variants
- Tailwind theme configured with brand palette (Mint Cream, Atomic Tangerine, etc.)

**PRD details:**
- Color palette defined: mint-cream (#EAF2EF), atomic-tangerine (#FF8547), ultrasonic-blue (#5200E0), fuchsia-flame (#E0007F), golden-pollen (#FFCE47)
- Typography: Press Start 2P (headings), Space Mono (body)
- User stories: 32 detailed stories covering all sections

## Constraints

- **Tech Stack**: Vite + React + TypeScript + Tailwind CSS + Framer Motion - fixed
- **Deployment**: Static hosting on Vercel - no server-side requirements
- **No Routing**: Single page SPA - no React Router needed

## Key Decisions

| Decision | Rationale | Outcome |
| -------- | --------- | -------- |
| Single-page SPA | Simple, no routing needed for portfolio | - Pending |
| Tailwind CSS | Utility-first, centralized color tokens | - Pending |
| Framer Motion | All animations, shared variants | - Pending |
| No dark mode v1 | Keep scope tight for v1 | - Pending |

---
*Last updated: 2025-05-14 after project initialization*