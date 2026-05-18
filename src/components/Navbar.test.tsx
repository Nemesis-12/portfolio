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
    })

    it('applies active underline class to link matching the intersecting section', () => {
      render(<Navbar />)

      act(() => {
        observerCallback(
          [{ target: section, isIntersecting: true } as unknown as IntersectionObserverEntry],
          {} as IntersectionObserver,
        )
      })

      const skillsLink = screen.getByText('SKILLS').closest('a')
      expect(skillsLink).not.toBeNull()
      expect(skillsLink!.className).toContain('border-b-2')
      expect(skillsLink!.className).toContain('border-atomic-tangerine')
    })
  })

  describe('issue #38 - logo size and container alignment', () => {
    it('FM_ logo uses text-xl', () => {
      render(<Navbar />)
      const logo = screen.getByText('FM_')
      expect(logo.className).toContain('text-xl')
    })

    it('nav inner content is wrapped in max-w-7xl mx-auto px-8 container', () => {
      render(<Navbar />)
      const nav = screen.getByRole('navigation')
      const innerContainer = nav.querySelector('div.max-w-7xl')
      expect(innerContainer).not.toBeNull()
      expect(innerContainer!.className).toContain('max-w-7xl')
      expect(innerContainer!.className).toContain('mx-auto')
      expect(innerContainer!.className).toContain('px-8')
    })
  })

  describe('issue #103 - fixed translucent v4 chrome', () => {
    it('navbar uses fixed positioning', () => {
      render(<Navbar />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('fixed')
    })

    it('navbar has subtle bottom border', () => {
      render(<Navbar />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('border-b')
    })

    it('navbar has backdrop blur', () => {
      render(<Navbar />)
      const nav = screen.getByRole('navigation')
      expect(nav.className).toContain('backdrop-blur')
    })
  })

  describe('issue #42 - > prefix on hover', () => {
    it('nav link shows > prefix on hover', async () => {
      const user = userEvent.setup()
      render(<Navbar />)

      const homeLink = screen.getByRole('link', { name: /home/i })
      const prefixSpan = homeLink.querySelector('span')
      expect(prefixSpan).not.toBeNull()
      expect(prefixSpan!.textContent).toBe('> ')
      expect(prefixSpan!.style.opacity).toBe('0')

      await user.hover(homeLink)
      expect(prefixSpan!.style.opacity).toBe('1')

      await user.unhover(homeLink)
      expect(prefixSpan!.style.opacity).toBe('0')
    })

    it('> prefix appears on hover for all nav links', async () => {
      const user = userEvent.setup()
      render(<Navbar />)

      const labels = ['HOME', 'PROJECTS', 'SKILLS', 'TIMELINE', 'CONTACT']
      for (const label of labels) {
        const link = screen.getByRole('link', { name: new RegExp(label, 'i') })
        const prefixSpan = link.querySelector('span')
        expect(prefixSpan).not.toBeNull()
        expect(prefixSpan!.textContent).toBe('> ')
        expect(prefixSpan!.style.opacity).toBe('0')

        await user.hover(link)
        expect(prefixSpan!.style.opacity).toBe('1')

        await user.unhover(link)
        expect(prefixSpan!.style.opacity).toBe('0')
      }
    })
  })
})
