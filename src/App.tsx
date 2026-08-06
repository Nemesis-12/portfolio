import { useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { SkipLink } from '@/components/layout/SkipLink'
import { Contact } from '@/components/sections/Contact'
import { EducationExperience } from '@/components/sections/EducationExperience'
import { Hero } from '@/components/sections/Hero'
import { ProjectsFeatured } from '@/components/sections/ProjectsFeatured'
import { ProjectsOther } from '@/components/sections/ProjectsOther'
import { Skills } from '@/components/sections/Skills'
import { cn } from '@/lib/cn'

/**
 * The six-section page shell (issue #311), plus the fixed header/nav/
 * skip-link shell (#312). Sections
 * render in a fixed order -- hero, projects (featured), projects (other),
 * skills, education & experience, contact -- each with placeholder content
 * for now.
 *
 * Layout/viewport-fit system: `src/styles/layout.css` (`.section-shell`,
 * the 880px breakpoint, scroll-snap on `:root`) and `src/lib/
 * useFitToViewport.ts` (the runtime shrink-to-fit pass) own that mechanism
 * end to end -- see those files. `.snap-shell` on <main> is a marker class
 * only -- it carries no CSS of its own.
 *
 * `<SkipLink>` is rendered first, before `<Header>`, so it is the very
 * first focusable element in DOM order -- a keyboard user's first Tab
 * lands there, not on the site mark or nav links. Its target, `<main
 * id="main-content">`, carries `tabIndex={-1}` so it is programmatically
 * focusable even though `<main>` is not natively in the tab order; see
 * `SkipLink.tsx` for why focus is moved explicitly rather than relied on
 * to follow the `#main-content` hash automatically.
 *
 * `<main>` deliberately carries NO `padding-top` compensation for the
 * fixed header (mochi/style-match audit -- a prior revision added
 * `padding-top: var(--header-h, ...)` here, reasoning the header would
 * otherwise cover the hero on first paint). The sample never does this
 * (`ideas/Portfolio.html` line 294: `<section id="top">`, the hero, is a
 * direct sibling of `<header>`, no offset wrapper) and that padding was
 * actively wrong: every `.section-shell` is already `min-height:100dvh`, so adding
 * the header's height on top of that made the FIRST section render
 * `header-height` pixels taller than one viewport -- it no longer fit one
 * screen, defeating the whole one-section-one-screen/scroll-snap premise,
 * and pushed the hero's content down by both the header height AND the
 * section's own top padding stacked together (visible as the empty band
 * above the hero in real renders). The header never needed the help: the
 * section's own `padding-block` top clamp (`clamp(4rem,9vh,5.5rem)` in
 * `.section-shell`, ~64-88px) already clears the fixed header's own
 * height (~59-64px) on every load, scrolled or not -- same as the sample.
 * `scroll-padding-top` (`layout.css`) was a separate, now-removed attempt
 * to solve the scrolling/anchor-jump case the same way -- see `layout.css`
 * for why that also double-offset sections and was removed in favor of
 * relying purely on the section's own top padding, matching the sample.
 *
 * Out of scope here: the Go board (#316) and real section content
 * (#317-#321). The mobile hamburger menu (#314) is a separate ticket --
 * the nav links and header rendered here are the desktop shape only. The
 * theme picker (#313) is wired up inside `<Header>` itself.
 *
 * Overlay background (#355): `MobileNav`'s full-screen panel needs to mark
 * everything else on the page `inert` while it's open. That "everything
 * else" is exactly this component's three top-level children --
 * `<SkipLink>`, `<Header>` (which itself contains the nav links, theme
 * picker, clock, and progress bar -- inerting the header cascades to all of
 * them, including `MobileNav`'s own trigger), and `<main>`. This module is
 * the one place that composes those three, so it is the one place that
 * *declares* the background list -- three refs, handed down as a prop --
 * rather than `MobileNav` rediscovering them by selector or id. See
 * `src/lib/overlay.ts` for why that distinction matters.
 */
function App() {
  const skipLinkRef = useRef<HTMLAnchorElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const overlayBackground = [skipLinkRef, headerRef, mainRef]

  return (
    <>
      <SkipLink ref={skipLinkRef} />
      <Header ref={headerRef} overlayBackground={overlayBackground} />
      <main
        ref={mainRef}
        id="main-content"
        tabIndex={-1}
        className={cn('snap-shell', 'flex min-h-screen flex-col', 'bg-bg text-fg')}
      >
        <Hero />
        <ProjectsFeatured />
        <ProjectsOther />
        <Skills />
        <EducationExperience />
        <Contact />
      </main>
    </>
  )
}

export default App
