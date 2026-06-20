import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MobileMenu from './MobileMenu'

const LINKS = [
  { label: 'HOME', href: '#home' },
  { label: 'PROJECTS', href: '#projects' },
  { label: 'SKILLS', href: '#skills' },
  { label: 'TIMELINE', href: '#timeline' },
  { label: 'CONTACT', href: '#contact' },
]

function renderMenu(isOpen: boolean, onClose = vi.fn()) {
  return render(<MobileMenu isOpen={isOpen} onClose={onClose} links={LINKS} />)
}

describe('MobileMenu', () => {
  it('stays mounted in the DOM when closed, but hidden from the accessibility tree', () => {
    renderMenu(false)

    const dialog = screen.queryByRole('dialog', { hidden: true })
    expect(dialog).not.toBeNull()
    expect(dialog).toHaveAttribute('aria-hidden', 'true')
    expect(dialog).toHaveAttribute('inert')

    // Not exposed via accessible role queries while closed.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('removes aria-hidden/inert and exposes the dialog when open', () => {
    renderMenu(true)

    const dialog = screen.getByRole('dialog')
    expect(dialog).not.toHaveAttribute('aria-hidden')
    expect(dialog).not.toHaveAttribute('inert')
  })

  it('renders all provided nav links when open', () => {
    renderMenu(true)

    const dialog = screen.getByRole('dialog')
    const links = within(dialog).getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))

    for (const { href, label } of LINKS) {
      expect(hrefs).toContain(href)
      expect(within(dialog).getByText(label)).toBeInTheDocument()
    }
  })

  it('calls onClose when a nav link is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderMenu(true, onClose)

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('link', { name: 'HOME' }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderMenu(true, onClose)

    await user.click(screen.getByRole('button', { name: /close menu/i }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not use framer-motion AnimatePresence mount/unmount for the overlay', () => {
    renderMenu(false)
    // Overlay element exists in the DOM tree even when closed (CSS-driven visibility).
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
  })
})
