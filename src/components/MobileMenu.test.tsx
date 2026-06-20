import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MobileMenu from './MobileMenu'

function getDialogNode(): HTMLElement | null {
  return document.querySelector('[aria-label="Mobile navigation"]')
}

const links = [
  { label: 'HOME', href: '#home' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'SKILLS', href: '#skills' },
  { label: 'TIMELINE', href: '#timeline' },
  { label: 'CONTACT', href: '#contact' },
]

describe('MobileMenu', () => {
  it('does not render the overlay dialog when closed', () => {
    render(<MobileMenu isOpen={false} onClose={vi.fn()} links={links} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the overlay with all nav links when isOpen is true', () => {
    render(<MobileMenu isOpen={true} onClose={vi.fn()} links={links} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const renderedLinks = within(dialog).getAllByRole('link')
    expect(renderedLinks).toHaveLength(5)
    const hrefs = renderedLinks.map((l) => l.getAttribute('href'))
    for (const { href } of links) {
      expect(hrefs).toContain(href)
    }
  })

  it('closes the overlay when a nav link is tapped', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<MobileMenu isOpen={true} onClose={onClose} links={links} />)

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('link', { name: 'HOME' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('closes the overlay when the close button is tapped', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<MobileMenu isOpen={true} onClose={onClose} links={links} />)

    await user.click(screen.getByRole('button', { name: /close menu/i }))

    expect(onClose).toHaveBeenCalled()
  })

  it('does not use framer-motion props for show/hide state', () => {
    render(<MobileMenu isOpen={true} onClose={vi.fn()} links={links} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('mobile-menu')
  })

  it('keeps the overlay node mounted (not unmounted) when closed after opening, so the CSS transition can play', () => {
    const { rerender } = render(<MobileMenu isOpen={true} onClose={vi.fn()} links={links} />)
    expect(getDialogNode()).not.toBeNull()

    rerender(<MobileMenu isOpen={false} onClose={vi.fn()} links={links} />)

    const dialog = getDialogNode()
    expect(dialog).not.toBeNull()
    expect(dialog).toHaveAttribute('aria-hidden', 'true')
    expect(dialog!.className).not.toContain('mobile-menu-open')
    // Hidden from the accessibility tree, so role-based queries correctly report it as absent.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('toggles the open class on the same node across repeated open/close cycles', () => {
    const { rerender } = render(<MobileMenu isOpen={false} onClose={vi.fn()} links={links} />)
    expect(getDialogNode()).toBeNull()

    rerender(<MobileMenu isOpen={true} onClose={vi.fn()} links={links} />)
    expect(getDialogNode()!.className).toContain('mobile-menu-open')

    rerender(<MobileMenu isOpen={false} onClose={vi.fn()} links={links} />)
    expect(getDialogNode()!.className).not.toContain('mobile-menu-open')

    rerender(<MobileMenu isOpen={true} onClose={vi.fn()} links={links} />)
    expect(getDialogNode()!.className).toContain('mobile-menu-open')
  })
})
