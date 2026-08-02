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
 * The six-section page shell (spec at docs/spec-portfolio-rewrite.md,
 * issue #311), plus the fixed header/nav/skip-link shell (#312). Sections
 * render in a fixed order -- hero, projects (featured), projects (other),
 * skills, education & experience, contact -- each with placeholder content
 * for now.
 *
 * Layout/viewport-fit system: above 880px `.section-shell` (src/styles/
 * layout.css) makes every section exactly one viewport tall, while the
 * scroll-snap itself lives on `:root` (the document is the real scroll
 * container, not `<main>`) so sections snap between whole screens; below
 * 880px both release and sections stack as ordinary flow content.
 * `.snap-shell` on <main> is a marker class only -- it carries no CSS of
 * its own. There is no JavaScript measuring loop -- fit comes entirely
 * from the fluid type scale and CSS documented in that file.
 *
 * `<SkipLink>` is rendered first, before `<Header>`, so it is the very
 * first focusable element in DOM order -- a keyboard user's first Tab
 * lands there, not on the site mark or nav links. Its target, `<main
 * id="main-content">`, carries `tabIndex={-1}` so it is programmatically
 * focusable even though `<main>` is not natively in the tab order; see
 * `SkipLink.tsx` for why focus is moved explicitly rather than relied on
 * to follow the `#main-content` hash automatically. `<main>` also carries
 * `padding-top: var(--header-h, ...)` (set by `Header.tsx`, same fallback
 * as `layout.css`'s `scroll-padding-top`) so the fixed header never
 * covers the top of the very first section on initial load, before any
 * scrolling -- `scroll-padding-top` alone only helps *after* a scroll or
 * anchor jump.
 *
 * Out of scope here: the Go board (#316) and real section content
 * (#317-#321). The mobile hamburger menu (#314) and the theme picker
 * (#313) are separate tickets -- the nav links and header rendered here
 * are the desktop shape only.
 */
function App() {
  return (
    <>
      <SkipLink />
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        className={cn('snap-shell', 'flex min-h-screen flex-col', 'bg-bg text-fg')}
        style={{ paddingTop: 'var(--header-h, 4.5rem)' }}
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
