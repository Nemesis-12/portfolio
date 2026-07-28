import { Contact } from '@/components/sections/Contact'
import { EducationExperience } from '@/components/sections/EducationExperience'
import { Hero } from '@/components/sections/Hero'
import { ProjectsFeatured } from '@/components/sections/ProjectsFeatured'
import { ProjectsOther } from '@/components/sections/ProjectsOther'
import { Skills } from '@/components/sections/Skills'
import { cn } from '@/lib/cn'

/**
 * The six-section page shell (spec at docs/spec-portfolio-rewrite.md,
 * issue #311). Sections render in a fixed order -- hero, projects
 * (featured), projects (other), skills, education & experience, contact --
 * each with placeholder content for now.
 *
 * Layout/viewport-fit system: above 880px `.snap-shell` + `.section-shell`
 * (src/styles/layout.css) make every section exactly one viewport tall
 * with scroll-snap between them; below 880px both release and sections
 * stack as ordinary flow content. There is no JavaScript measuring loop --
 * fit comes entirely from the fluid type scale and CSS documented in that
 * file.
 *
 * Out of scope here: the Go board (#316), header/nav (#312), and real
 * section content (#317-#321).
 */
function App() {
  return (
    <main className={cn('snap-shell', 'flex min-h-screen flex-col', 'bg-bg text-fg')}>
      <Hero />
      <ProjectsFeatured />
      <ProjectsOther />
      <Skills />
      <EducationExperience />
      <Contact />
    </main>
  )
}

export default App
