import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Navbar from './Navbar'

describe('Navbar', () => {
  it('renders FM_ logo that links to page top', () => {
    render(<Navbar />)
    const logo = screen.getByText('FM_')
    expect(logo).toBeInTheDocument()
    expect(logo.closest('a')).toHaveAttribute('href', '#')
  })

  it('renders all five nav links in the desktop nav', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation')
    const links = within(nav).getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))
    expect(hrefs).toContain('#home')
    expect(hrefs).toContain('#projects')
    expect(hrefs).toContain('#skills')
    expect(hrefs).toContain('#timeline')
    expect(hrefs).toContain('#contact')
  })

  it('shows label text for all five nav links', () => {
    render(<Navbar />)
    for (const label of ['HOME', 'PROJECTS', 'SKILLS', 'TIMELINE', 'CONTACT']) {
      expect(screen.getByText(label)).toBeInTheDocument()
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
    let section: HTMLElement
    let observerCallback!: IntersectionObserverCallback

    beforeEach(() => {
      section = document.createElement('section')
      section.id = 'skills'
      document.body.appendChild(section)

      vi.stubGlobal('IntersectionObserver', vi.fn(function (cb: IntersectionObserverCallback) {
        observerCallback = cb
        return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }
      }))
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      document.body.removeChild(section)
      document.getElementById('projects')?.remove()
    })

    it('scopes active color and underline to the label span only', () => {
      render(<Navbar />)

      act(() => {
        observerCallback(
          [{ target: section, isIntersecting: true } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver,
        )
      })

      const skillsLink = screen.getByText('SKILLS').closest('a')
      expect(skillsLink).not.toBeNull()
      const skillsLabel = screen.getByText('SKILLS')

      expect(skillsLink).toHaveClass('nav-link', 'active')
      expect(skillsLabel).toHaveClass('nav-label')
      expect(skillsLabel.className).not.toContain('border-b-2')
      expect(skillsLabel.className).not.toContain('border-atomic-tangerine')
      expect(skillsLink!.querySelector('[data-testid="nav-caret"]')).toBeNull()
    })

    it('restores inactive link caret and removes label underline when active section changes', () => {
      const projectsSection = document.createElement('section')
      projectsSection.id = 'projects'
      document.body.appendChild(projectsSection)

      render(<Navbar />)

      act(() => {
        observerCallback(
          [{ target: section, isIntersecting: true } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver,
        )
      })

      act(() => {
        observerCallback(
          [{ target: projectsSection, isIntersecting: true } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver,
        )
      })

      const skillsLink = screen.getByText('SKILLS').closest('a')
      const skillsLabel = screen.getByText('SKILLS')
      const projectsLink = screen.getByText('PROJECTS').closest('a')
      const projectsLabel = screen.getByText('PROJECTS')

      expect(skillsLink!.querySelector('[data-testid="nav-caret"]')).not.toBeNull()
      expect(skillsLink).not.toHaveClass('active')
      expect(skillsLabel).toHaveClass('nav-label')
      expect(projectsLink).toHaveClass('nav-link', 'active')
      expect(projectsLink!.querySelector('[data-testid="nav-caret"]')).toBeNull()
      expect(projectsLabel).toHaveClass('nav-label')
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
      const section = document.createElement('section')
      section.id = 'skills'
      document.body.appendChild(section)
      let observerCallback!: IntersectionObserverCallback

      vi.stubGlobal('IntersectionObserver', vi.fn(function (cb: IntersectionObserverCallback) {
        observerCallback = cb
        return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }
      }))

      try {
        render(<Navbar />)

        act(() => {
          observerCallback(
            [{ target: section, isIntersecting: true } as unknown as IntersectionObserverEntry],
            {} as IntersectionObserver,
          )
        })

        const skillsLink = screen.getByText('SKILLS').closest('a')
        const skillsLabel = screen.getByText('SKILLS')

        expect(skillsLink).toHaveClass('nav-link', 'active')
        expect(skillsLabel).toHaveClass('nav-label')
        expect(skillsLabel.className).not.toContain('border-b-2')
        expect(skillsLabel.className).not.toContain('border-atomic-tangerine')
        expect(skillsLabel.className).not.toContain('text-atomic-tangerine')
        expect(skillsLink!.querySelector('.nav-caret')).toBeNull()
      } finally {
        vi.unstubAllGlobals()
        document.body.removeChild(section)
      }
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

    it('active link keeps the > prefix absent', () => {
      const section = document.createElement('section')
      section.id = 'skills'
      document.body.appendChild(section)
      let observerCallback!: IntersectionObserverCallback

      vi.stubGlobal('IntersectionObserver', vi.fn(function (cb: IntersectionObserverCallback) {
        observerCallback = cb
        return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }
      }))

      try {
        render(<Navbar />)

        act(() => {
          observerCallback(
            [{ target: section, isIntersecting: true } as unknown as IntersectionObserverEntry],
            {} as IntersectionObserver,
          )
        })

        const skillsLink = screen.getByRole('link', { name: /skills/i })
        const labelSpan = skillsLink.querySelector('.nav-label')
        const caretSpan = skillsLink.querySelector('[data-testid="nav-caret"]')
        expect(labelSpan).toHaveClass('nav-label')
        expect(caretSpan).toBeNull()
      } finally {
        vi.unstubAllGlobals()
        document.body.removeChild(section)
      }
    })
  })
})
