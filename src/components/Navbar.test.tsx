import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SECTIONS } from '../data/sections'
import Navbar from './Navbar'

const expectedNavHrefs = SECTIONS.map((section) => `#${section.id}`)
const expectedNavLabels = SECTIONS.map((section) => section.navLabel)

const VIEWPORT_HEIGHT = 800

function rectWithHeight(top: number, height: number): DOMRect {
  return {
    top,
    right: 1000,
    bottom: top + height,
    left: 0,
    width: 1000,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

function mockMajorSection(id: string, top: number, height: number): HTMLElement {
  const section = document.createElement(id === 'contact' ? 'footer' : 'section')
  section.id = id
  vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(rectWithHeight(top, height))
  document.body.appendChild(section)
  return section
}

function dispatchScrollUpdate() {
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

// Mobile menu now stays permanently mounted in the DOM (CSS-driven visibility),
// so desktop-nav-link assertions must be scoped to the desktop <nav> to avoid
// matching the duplicate links rendered inside the mobile menu.
function getDesktopNavText(text: string) {
  const nav = screen.getByRole('navigation')
  return within(nav).getByText(text)
}

describe('Navbar', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: VIEWPORT_HEIGHT,
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })
  it('renders FM_ logo that links to page top', () => {
    render(<Navbar />)
    const logo = screen.getByText('FM_')
    expect(logo).toBeInTheDocument()
    expect(logo.closest('a')).toHaveAttribute('href', '#')
  })

  it('renders all registry nav links in the desktop nav', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    const links = within(nav).getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    for (const href of expectedNavHrefs) {
      expect(hrefs).toContain(href)
    }
  })

  it('shows label text for all registry nav links', () => {
    render(<Navbar />)
    for (const label of expectedNavLabels) {
      expect(getDesktopNavText(label)).toBeInTheDocument()
    }
  })

  it('renders hamburger button', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('mobile menu is not visible on initial render', () => {
    render(<Navbar />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('clicking hamburger opens mobile menu with all nav links', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const links = within(dialog).getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('#home')
    expect(hrefs).toContain('#projects')
    expect(hrefs).toContain('#skills')
    expect(hrefs).toContain('#timeline')
    expect(hrefs).toContain('#contact')
  })

  it('clicking close button dismisses mobile menu', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close menu/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('clicking a nav link inside mobile menu closes the menu', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    const dialog = screen.getByRole('dialog')

    const heroLink = within(dialog).getByRole('link', { name: 'HOME' })
    await user.click(heroLink)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('active section highlighting', () => {
    it('scopes active color and underline to the label span only', () => {
      mockMajorSection('skills', 0, VIEWPORT_HEIGHT)
      render(<Navbar />)
      dispatchScrollUpdate()

      const skillsLink = getDesktopNavText('SKILLS').closest('a')
      expect(skillsLink).not.toBeNull()
      const skillsLabel = getDesktopNavText('SKILLS')

      expect(skillsLink).toHaveClass('nav-link', 'active')
      expect(skillsLabel).toHaveClass('nav-label')
      expect(skillsLabel.className).not.toContain('border-b-2')
      expect(skillsLabel.className).not.toContain('border-atomic-tangerine')
      expect(skillsLink!.querySelector('[data-testid="nav-caret"]')).not.toBeNull()
      expect(skillsLink!.querySelector('[data-testid="nav-caret"]')).toHaveTextContent('>')
    })

    it('restores inactive link caret and removes label underline when active section changes', () => {
      mockMajorSection('skills', VIEWPORT_HEIGHT, VIEWPORT_HEIGHT)
      const projectsSection = mockMajorSection('projects', -1600, VIEWPORT_HEIGHT * 6)

      render(<Navbar />)

      dispatchScrollUpdate()

      vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(
        rectWithHeight(-1600, VIEWPORT_HEIGHT * 6),
      )
      dispatchScrollUpdate()

      const skillsLink = getDesktopNavText('SKILLS').closest('a')
      const skillsLabel = getDesktopNavText('SKILLS')
      const projectsLink = getDesktopNavText('PROJECTS').closest('a')
      const projectsLabel = getDesktopNavText('PROJECTS')

      expect(skillsLink!.querySelector('[data-testid="nav-caret"]')).not.toBeNull()
      expect(skillsLink).not.toHaveClass('active')
      expect(skillsLabel).toHaveClass('nav-label')
      expect(projectsLink).toHaveClass('nav-link', 'active')
      expect(projectsLink!.querySelector('[data-testid="nav-caret"]')).not.toBeNull()
      expect(projectsLink!.querySelector('[data-testid="nav-caret"]')).toHaveTextContent('>')
      expect(projectsLabel).toHaveClass('nav-label')
    })

    it('keeps PROJECTS active for its owning scroll runway when no internal panel owns the sample line', () => {
      mockMajorSection('home', -VIEWPORT_HEIGHT, VIEWPORT_HEIGHT)
      mockMajorSection('projects', -(VIEWPORT_HEIGHT * 6 + 24), VIEWPORT_HEIGHT * 6)
      mockMajorSection('skills', VIEWPORT_HEIGHT * 0.4 + 120, VIEWPORT_HEIGHT)

      render(<Navbar />)
      dispatchScrollUpdate()

      expect(getDesktopNavText('PROJECTS').closest('a')).toHaveClass('active')
      expect(getDesktopNavText('SKILLS').closest('a')).not.toHaveClass('active')
    })

    it('keeps TIMELINE active for its owning scroll runway when no internal panel owns the sample line', () => {
      mockMajorSection('home', -VIEWPORT_HEIGHT * 4, VIEWPORT_HEIGHT)
      mockMajorSection('projects', -VIEWPORT_HEIGHT * 3, VIEWPORT_HEIGHT)
      mockMajorSection('skills', -VIEWPORT_HEIGHT * 2, VIEWPORT_HEIGHT)
      mockMajorSection('timeline', -(VIEWPORT_HEIGHT * 3 + 24), VIEWPORT_HEIGHT * 3)
      mockMajorSection('contact', VIEWPORT_HEIGHT * 0.4 + 120, VIEWPORT_HEIGHT)

      render(<Navbar />)
      dispatchScrollUpdate()

      expect(getDesktopNavText('TIMELINE').closest('a')).toHaveClass('active')
      expect(getDesktopNavText('CONTACT').closest('a')).not.toHaveClass('active')
    })
  })

  describe('issue #38 - logo size and container alignment', () => {
    it('FM_ logo uses nav-logo portfolio class', () => {
      render(<Navbar />)
      const logo = screen.getByText('FM_')
      expect(logo).toHaveClass('nav-logo')
    })

    it('nav spans full width without narrow shell constraint', () => {
      render(<Navbar />)
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('nav')
      expect(nav.className).not.toContain('max-w-7xl')
      expect(nav.className).not.toContain('mx-auto')
    })
  })

  describe('issue #179 - v4 floating terminal bar visual spec', () => {
    it('navbar root uses portfolio.css nav anchor class', () => {
      render(<Navbar />)
      expect(screen.getByRole('navigation')).toHaveClass('nav')
    })

    it('FM_ logo uses nav-logo portfolio class', () => {
      render(<Navbar />)
      expect(screen.getByText('FM_')).toHaveClass('nav-logo')
    })

    it('desktop nav list uses nav-list portfolio class', () => {
      render(<Navbar />)
      const nav = screen.getByRole('navigation')
      expect(nav.querySelector('.nav-list')).toBeInTheDocument()
    })

    it('each desktop link uses nav-link and nav-label structure', () => {
      render(<Navbar />)
      const links = screen.getByRole('navigation').querySelectorAll('.nav-link')
      expect(links.length).toBe(5)
      links.forEach((link) => {
        expect(link.querySelector('.nav-label')).toBeInTheDocument()
      })
    })

    it('navbar does not use Tailwind chrome utilities superseding portfolio.css', () => {
      render(<Navbar />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).not.toContain('bg-graphite')
      expect(nav.className).not.toContain('backdrop-blur')
      expect(nav.className).not.toContain('border-b')
      expect(nav.className).not.toContain('fixed')
    })

    it('active link applies active class with nav-label underline via CSS not border utilities', () => {
      mockMajorSection('skills', 0, VIEWPORT_HEIGHT)
      render(<Navbar />)
      dispatchScrollUpdate()

      const skillsLink = getDesktopNavText('SKILLS').closest('a')
      const skillsLabel = getDesktopNavText('SKILLS')

      expect(skillsLink).toHaveClass('nav-link', 'active')
      expect(skillsLabel).toHaveClass('nav-label')
      expect(skillsLabel.className).not.toContain('border-b-2')
      expect(skillsLabel.className).not.toContain('border-atomic-tangerine')
      expect(skillsLabel.className).not.toContain('text-atomic-tangerine')
      expect(skillsLink!.querySelector('.nav-caret')).not.toBeNull()
      expect(skillsLink!.querySelector('.nav-caret')).toHaveTextContent('>')
    })
  })

  describe('issue #208 - active link shows caret', () => {
    it('keeps nav-caret in DOM on active link for CSS visibility', () => {
      mockMajorSection('skills', 0, VIEWPORT_HEIGHT)
      render(<Navbar />)
      dispatchScrollUpdate()

      const skillsLink = screen.getByRole('link', { name: /skills/i })
      const caret = skillsLink.querySelector('[data-testid="nav-caret"]')

      expect(skillsLink).toHaveClass('nav-link', 'active')
      expect(caret).not.toBeNull()
      expect(caret).toHaveTextContent('>')
      expect(caret).toHaveClass('nav-caret')
      expect((caret as HTMLElement).style.opacity).toBe('')
    })
  })

  describe('issue #42 - > prefix on hover', () => {
    it('nav link includes nav-caret prefix styled by portfolio.css', () => {
      render(<Navbar />)

      const homeLink = screen.getByRole('link', { name: /home/i })
      const caret = homeLink.querySelector('.nav-caret')
      expect(caret).not.toBeNull()
      expect(caret).toHaveTextContent('>')
      expect(caret).toHaveAttribute('data-testid', 'nav-caret')
      expect((caret as HTMLElement).style.opacity).toBe('')
    })

    it('> prefix is present on all inactive nav links', () => {
      render(<Navbar />)

      const labels = ['HOME', 'PROJECTS', 'SKILLS', 'TIMELINE', 'CONTACT']
      for (const label of labels) {
        const link = screen.getByRole('link', { name: new RegExp(label, 'i') })
        const caret = link.querySelector('.nav-caret')
        expect(caret).not.toBeNull()
        expect(caret).toHaveTextContent('>')
      }
    })

    it('active link keeps the > prefix in DOM for CSS-driven visibility', () => {
      mockMajorSection('skills', 0, VIEWPORT_HEIGHT)
      render(<Navbar />)
      dispatchScrollUpdate()

      const skillsLink = screen.getByRole('link', { name: /skills/i })
      const labelSpan = skillsLink.querySelector('.nav-label')
      const caretSpan = skillsLink.querySelector('[data-testid="nav-caret"]')
      expect(labelSpan).toHaveClass('nav-label')
      expect(caretSpan).not.toBeNull()
      expect(caretSpan).toHaveTextContent('>')
    })
  })

  describe('issue #215 - active section tracking and smooth jumps', () => {
    it('keeps PROJECTS active across the full internal scroll range', () => {
      mockMajorSection('home', -VIEWPORT_HEIGHT, VIEWPORT_HEIGHT)
      const projects = mockMajorSection('projects', -VIEWPORT_HEIGHT * 3, VIEWPORT_HEIGHT * 6)
      mockMajorSection('skills', VIEWPORT_HEIGHT * 4, VIEWPORT_HEIGHT)

      render(<Navbar />)

      for (const top of [-VIEWPORT_HEIGHT, -VIEWPORT_HEIGHT * 3, -(VIEWPORT_HEIGHT * 6 - VIEWPORT_HEIGHT)]) {
        vi.spyOn(projects, 'getBoundingClientRect').mockReturnValue(
          rectWithHeight(top, VIEWPORT_HEIGHT * 6),
        )
        dispatchScrollUpdate()

        expect(getDesktopNavText('PROJECTS').closest('a')).toHaveClass('active')
      }
    })

    it('keeps TIMELINE active across the full internal scroll range', () => {
      mockMajorSection('home', -VIEWPORT_HEIGHT * 2, VIEWPORT_HEIGHT)
      mockMajorSection('projects', -VIEWPORT_HEIGHT * 8, VIEWPORT_HEIGHT * 6)
      mockMajorSection('skills', -VIEWPORT_HEIGHT, VIEWPORT_HEIGHT)
      const timeline = mockMajorSection('timeline', -VIEWPORT_HEIGHT * 2, VIEWPORT_HEIGHT * 3)
      mockMajorSection('contact', VIEWPORT_HEIGHT * 2, VIEWPORT_HEIGHT)

      render(<Navbar />)

      for (const top of [0, -VIEWPORT_HEIGHT, -(VIEWPORT_HEIGHT * 3 - VIEWPORT_HEIGHT)]) {
        vi.spyOn(timeline, 'getBoundingClientRect').mockReturnValue(
          rectWithHeight(top, VIEWPORT_HEIGHT * 3),
        )
        dispatchScrollUpdate()

        expect(getDesktopNavText('TIMELINE').closest('a')).toHaveClass('active')
      }
    })

    it('desktop nav clicks smooth-scroll to the target section', async () => {
      const user = userEvent.setup()
      const projects = mockMajorSection('projects', 0, VIEWPORT_HEIGHT)
      Object.defineProperty(projects, 'offsetTop', { configurable: true, value: 900 })
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

      render(<Navbar />)

      await user.click(screen.getByRole('link', { name: /projects/i }))

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 900, behavior: 'smooth' })
    })

    it('logo click smooth-scrolls to home', async () => {
      const user = userEvent.setup()
      const home = mockMajorSection('home', 0, VIEWPORT_HEIGHT)
      Object.defineProperty(home, 'offsetTop', { configurable: true, value: 0 })
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

      render(<Navbar />)

      await user.click(screen.getByText('FM_'))

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    })

    it('mobile menu nav clicks smooth-scroll to the target section', async () => {
      const user = userEvent.setup()
      const timeline = mockMajorSection('timeline', 0, VIEWPORT_HEIGHT)
      Object.defineProperty(timeline, 'offsetTop', { configurable: true, value: 2400 })
      const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

      render(<Navbar />)

      await user.click(screen.getByRole('button', { name: /open menu/i }))
      await user.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'TIMELINE' }))

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 2400, behavior: 'smooth' })
    })
  })
})
