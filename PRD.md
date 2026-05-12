# PRD: Portfolio Website — Farhan Mohammed

## Problem Statement

As a CS student and developer, I have no public-facing presence to share with recruiters, hiring managers, and collaborators. My projects, skills, and experience exist in isolation (resume PDF, GitHub repos) with no unified, visually compelling surface to present them. I need a personal portfolio website that reflects my identity, communicates my technical depth, and gives visitors a clear path to reach me.

## Solution

A single-page scrollable portfolio website built with Vite + React + TypeScript + Tailwind CSS. The site features a terminal/hacker aesthetic — pixel fonts, monospace body text, a dot-grid background, and a branded loading screen — with five sections: Hero, Projects, Skills, Timeline, and Contact. It is statically hosted on Vercel with zero server-side requirements.

## User Stories

1. As a first-time visitor, I want to see a branded loading screen when the page loads, so that I get an immediate sense of the site's personality before the content appears.
2. As a visitor, I want the loading screen to show a progress bar and cycling terminal status messages, so that the experience feels like a system booting up.
3. As a visitor, I want the loading screen to appear on every visit, so that the full first impression is always preserved.
4. As a visitor, I want the loading screen to use the site's light ivory background, so that the transition to the main content feels seamless.
5. As a visitor, I want a sticky navigation bar at the top of the page, so that I can jump to any section at any time.
6. As a visitor, I want the active section to be visually highlighted in the navbar, so that I always know where I am on the page.
7. As a visitor on desktop, I want to see all nav links inline, so that navigation is immediate and accessible.
8. As a visitor on mobile, I want to tap a hamburger icon to open a fullscreen navigation overlay, so that the nav doesn't crowd my small screen.
9. As a visitor on mobile, I want the fullscreen menu to close when I tap a link, so that I'm taken directly to the section without an extra step.
10. As a visitor, I want to land on a hero section that shows the developer's name in a large pixel font, so that I immediately know whose portfolio this is.
11. As a visitor, I want to see a subtitle ("CS_STUDENT · DEVELOPER") beneath the name, so that I quickly understand the developer's profile.
12. As a visitor, I want a VIEW_WORK → call-to-action on the hero, so that I'm invited to explore the projects.
13. As a visitor, I want sections to fade and slide in as I scroll to them, so that the page feels polished and dynamic.
14. As a visitor, I want interactive elements to ease in and out smoothly on hover, so that the UI feels responsive and high-quality.
15. As a visitor, I want to browse a numbered list of projects in an accordion layout, so that I can scan all projects at a glance and expand the ones that interest me.
16. As a visitor, I want only one project to be expanded at a time, so that the layout stays predictable and uncluttered.
17. As a visitor, I want all projects collapsed by default, so that I'm in control of what I explore.
18. As a visitor, I want to see tech stack tags on each project row, so that I can quickly identify projects relevant to my interests.
19. As a visitor, I want an expanded project to show a description and an image, so that I get a fuller picture of the work.
20. As a visitor, I want to browse the developer's skills in a bento grid, so that I can take in the full skill set at a glance in a visually interesting layout.
21. As a visitor on mobile, I want the bento grid to reflow into a compact asymmetric layout, so that it remains readable and visually engaging on a small screen.
22. As a visitor, I want each skill tile to be color-coded from the brand palette, so that the grid is vibrant and reinforces the site's identity.
23. As a visitor, I want each skill tile to show a category label (LANGUAGE, FRAMEWORK, TOOL, etc.) and a skill name, so that I can understand the context of each skill.
24. As a visitor, I want to read a chronological timeline of the developer's education, internships, and achievements, so that I can understand their career trajectory.
25. As a visitor, I want each timeline entry to show a date range, institution/event name, role title, and description, so that I have enough context to evaluate the experience.
26. As a visitor, I want to reach a Contact section at the bottom of the page, so that I have a clear endpoint and call to action.
27. As a visitor, I want a "LET'S CONNECT" heading and a prominent mailto CTA button, so that contacting the developer requires minimal effort.
28. As a visitor, I want footer links to GitHub, LinkedIn, Email, and Resume, so that I can access all relevant profiles from one place.
29. As a visitor, I want the Resume link to open in a new tab, so that I can preview it without leaving the portfolio.
30. As a recruiter on a phone, I want the entire site to be mobile-responsive, so that I can review the portfolio during a commute or on the go.
31. As a developer maintaining the site, I want project content stored in a typed data file, so that I can add or update projects without touching component code.
32. As a developer, I want all color tokens centralised, so that updating the palette is a single-source change.

## Implementation Decisions

### Stack
- **Vite + React + TypeScript** — SPA, no server-side rendering required. Static output deployed to Vercel with zero config.
- **Tailwind CSS** — utility-first styling. Color tokens from the brand palette configured in the Tailwind theme.
- **Framer Motion** — all animations. Shared variants for scroll-triggered fade-up entry and hover ease-in/out transitions.

### Color Palette (Tailwind theme tokens)
| Token | Hex | Usage |
|---|---|---|
| `mint-cream` | `#EAF2EF` | Page background, loading screen background |
| `atomic-tangerine` | `#FF8547` | Accents, active nav underline, progress bar, bento tiles |
| `ultrasonic-blue` | `#5200E0` | Bento tiles |
| `fuchsia-flame` | `#E0007F` | Bento tiles |
| `golden-pollen` | `#FFCE47` | Bento tiles |
| `black` | `#050609` | Headings |
| `graphite` | `#353535` | Body text, secondary text |

### Typography
- **Press Start 2P** (Google Fonts) — all headings and display text
- **Space Mono** (Google Fonts) — body text, nav links, labels, tags. Chosen to complement the pixel font's retro-technical aesthetic.

### Loading Screen
- Renders as a full-page overlay on top of the main content on every visit (no session caching).
- Background: `#EAF2EF` (Mint Cream).
- Centre-aligned: `SYSTEM_INIT...` label, name in pixel font, animated progress bar (orange fill), and a cycling status message below the bar.
- Status message sequence: `ESTABLISHING_SIGNAL` → `COMPILING_MODULES` → `LOADING_ASSETS` → `SYSTEM_READY`.
- On completion, the overlay fades out via Framer Motion to reveal the site.

### Navbar
- Sticky, full-width, transparent over the hero.
- Logo: `FM_` in pixel font, links to top of page.
- Links: HERO, PROJECTS, SKILLS, TIMELINE, CONTACT — smooth-scroll to section anchors.
- Active link: orange underline, determined by IntersectionObserver watching each section.
- **Mobile**: hamburger icon replaces inline links. Opens `MobileMenu`.

### MobileMenu
- Fullscreen overlay (covers entire viewport) with all nav links centred.
- Animated open/close via Framer Motion.
- Closes on any link tap or explicit close button.

### HeroSection
- Dot-grid background pattern via CSS (radial-gradient or SVG).
- `// PORTFOLIO_INIT` label in accent orange.
- Name in large pixel font, black.
- Subtitle: `CS_STUDENT · DEVELOPER` in monospace, graphite.
- `VIEW_WORK →` link that smooth-scrolls to the Projects section.

### ProjectsSection
- Renders from `src/data/projects.ts`.
- Accordion: one item open at a time; none open by default.
- Each row shows: index (`_01`), project name, tech stack tags, expand/collapse arrow.
- Expanded row shows: project image (placeholder), description paragraph.
- Expansion animated via Framer Motion layout animation.

### Project Data Shape
```ts
interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  image?: string
}
```

### SkillsSection
- Bento grid — hardcoded tiles, no data file.
- Each tile: category label (small caps, muted) + skill name (pixel font or bold monospace).
- Tile colours assigned per skill from the brand palette (orange, purple, fuchsia, yellow, dark).
- Desktop: asymmetric CSS grid matching the mockup proportions.
- Mobile: compact asymmetric bento reflow (2–3 column grid, varying row spans) per `bento_mobile.png` reference.

### TimelineSection
- Hardcoded entries: education, internship(s), hackathon(s), TA role.
- Each entry: date range (left column, accent orange), institution/event (link, accent orange), role title (pixel font), description (monospace).
- Horizontal rule separates entries.

### ContactSection
- `// 04 CONTACT` section label.
- `LET'S CONNECT.` in large pixel font.
- Single CTA: `SEND_MESSAGE →` as an `<a href="mailto:...">` link, styled as a button.
- Footer links: `// GITHUB`, `// LINKEDIN`, `// EMAIL`, `// RESUME` — Resume opens in new tab (`target="_blank"`).
- Resume PDF served from `public/resume.pdf`.

### Animation System
- Shared Framer Motion variants object exported from a single module:
  - `fadeUp` — used on every section and major element for scroll-triggered entry (`whileInView`, `once: true`)
  - `hoverEase` — ease-in/out scale/brightness on interactive elements (project rows, skill tiles, nav links, CTA buttons)
- Accordion expansion uses Framer Motion `AnimatePresence` + `motion.div` with `height: auto` layout animation.

### Mobile Responsiveness
- Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) throughout.
- Navbar collapses to hamburger below `md` breakpoint.
- Bento grid switches grid-template at `md` breakpoint.
- Project accordion remains full-width on all breakpoints.
- Hero font size scales down on small screens.

## Testing Decisions

**What makes a good test here:** test external behaviour, not implementation details. For UI components, this means testing what the user sees and can interact with — not internal state or class names.

**Modules to test:**

### ProjectsSection / Accordion (priority)
- All projects are collapsed on initial render.
- Clicking a collapsed project expands it and shows its content.
- Clicking an already-expanded project collapses it.
- Clicking a second project collapses the first and expands the second.
- Rendered project rows match the entries in `projects.ts`.

**Testing approach:** Vitest + React Testing Library. Render the component with mock project data, query by visible text and roles, assert visibility of expanded content.

### LoadingScreen
- Cycles through all status messages in sequence.
- Calls its `onComplete` callback after the final message.

**Testing approach:** Vitest with fake timers to advance through the message sequence without real delays.

**No tests needed for:** SkillsSection (purely static markup), TimelineSection (static markup), ContactSection (static markup + a single link), Navbar scroll-spy (IntersectionObserver is difficult to test meaningfully in jsdom and the behaviour is non-critical).

## Out of Scope

- Dark mode (deferred to a future iteration)
- Contact form with real email delivery
- CMS or headless content management
- Blog or writing section
- Project detail pages / routing
- Analytics or tracking
- SEO meta tags and Open Graph (can be added later with `react-helmet`)
- Internationalisation
- Accessibility audit (WCAG compliance not explicitly required for v1)

## Further Notes

- The `ideas/` folder contains the full design reference: colour palette swatches, mockups for Hero, Projects, Skills, Timeline, Contact, mobile bento layout, and the loading screen. Treat these as the source of truth for visual decisions.
- The `ideas/resume.pdf` is the real resume to be placed in `public/resume.pdf` when ready. A placeholder should be used during development.
- Font imports go via Google Fonts in `index.html` to avoid bundle bloat.
- Vercel deployment is zero-config for Vite — `vercel.json` is not required unless a custom domain or redirect is added later.
