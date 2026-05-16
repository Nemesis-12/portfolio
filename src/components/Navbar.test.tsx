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
})
