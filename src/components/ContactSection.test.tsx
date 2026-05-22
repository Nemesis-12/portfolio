import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import { useInView } from 'framer-motion'
import ContactSection from './ContactSection'

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return { ...actual, useInView: vi.fn().mockReturnValue(false) }
})

const canonicalEmailHref = 'mailto:famohammed@shockers.wichita.edu'

function renderWithTypingComplete() {
  vi.mocked(useInView).mockReturnValue(true)
  vi.useFakeTimers()
  render(<ContactSection />)
  act(() => { vi.advanceTimersByTime(250) })
  act(() => { vi.advanceTimersByTime(400) })
}

describe('ContactSection', () => {

  beforeEach(() => {
    vi.mocked(useInView).mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the send message link with the expected destination', () => {
    renderWithTypingComplete()
    const sendMessageLink = screen.getByRole('link', { name: 'SEND_MESSAGE →' })

    expect(sendMessageLink).toHaveAttribute('href', canonicalEmailHref)
  })

  describe('issue #185 - full-screen contact heading', () => {
    it('uses footer#contact as the root contact element', () => {
      render(<ContactSection />)
      const contact = document.querySelector('#contact')

      expect(contact?.tagName.toLowerCase()).toBe('footer')
    })

    it('applies footer-big to the contact heading', () => {
      render(<ContactSection />)
      const heading = document.querySelector('#contact .footer-big')

      expect(heading).toBeInTheDocument()
    })

    it('splits LET\'S and CONNECT. into footer-big-line spans', () => {
      renderWithTypingComplete()

      const lines = document.querySelectorAll('#contact .footer-big-line')
      expect(lines).toHaveLength(2)
      expect(lines[0]).toHaveTextContent("LET'S")
      expect(lines[1]).toHaveTextContent('CONNECT.')
    })

    it('styles the period in orange and uses a portfolio cursor block', () => {
      renderWithTypingComplete()

      const period = document.querySelector('#contact .footer-big .period')
      const cursor = document.querySelector('[data-testid="contact-cursor"]')

      expect(period).toHaveTextContent('.')
      expect(cursor).toHaveClass('cursor')
    })
  })

  describe('issue #87 - LET\'S CONNECT. typewriter', () => {
    it('heading is not visible when section is out of view', () => {
      vi.mocked(useInView).mockReturnValue(false)
      render(<ContactSection />)

      expect(screen.queryByText("LET'S")).not.toBeInTheDocument()
    })

    it('heading types out character by character when section enters viewport', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      render(<ContactSection />)

      // 5 chars × 50ms = 250ms for "LET'S"
      act(() => { vi.advanceTimersByTime(250) })
      expect(screen.getByText("LET'S")).toBeInTheDocument()

      // 5 + 7 chars × 50ms = 600ms for full text plus period
      act(() => { vi.advanceTimersByTime(400) })
      expect(document.querySelector('#contact .footer-big')).toHaveTextContent("LET'SCONNECT.")
    })

    it('blinking cursor persists after typing completes', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      render(<ContactSection />)

      // Wait for typing to complete: 12 chars × 50ms = 600ms + buffer
      act(() => { vi.advanceTimersByTime(250) })
      act(() => { vi.advanceTimersByTime(400) })

      const cursor = document.querySelector('[data-testid="contact-cursor"]')
      expect(cursor).toBeInTheDocument()
      expect(cursor).toHaveClass('cursor')
    })
  })

  describe('issue #186 - CTA button, social links, and footer metadata', () => {
    it('merges contact CTA, social links, and footer metadata into a single footer#contact', () => {
      render(<ContactSection />)

      expect(document.querySelectorAll('footer')).toHaveLength(1)
      expect(document.querySelector('#footer')).not.toBeInTheDocument()
      expect(document.querySelector('#contact')).toBeInTheDocument()
    })

    it('wraps the heading, CTA button, and social links in footer-cta', () => {
      renderWithTypingComplete()
      const contact = document.querySelector('#contact') as HTMLElement
      const cta = contact.querySelector('.footer-cta')

      expect(cta).toBeInTheDocument()
      expect(cta?.querySelector('.footer-big')).toBeInTheDocument()
      expect(within(contact).getByRole('link', { name: 'SEND_MESSAGE →' })).toBeInTheDocument()
      expect(cta?.querySelector('.footer-socials')).toBeInTheDocument()
    })

    it('uses btn btn-fill for the centered SEND_MESSAGE CTA', () => {
      renderWithTypingComplete()
      const sendMessage = screen.getByRole('link', { name: 'SEND_MESSAGE →' })

      expect(sendMessage).toHaveClass('btn', 'btn-fill')
      expect(sendMessage.closest('.footer-cta')).toBeInTheDocument()
    })

    it('renders social links with slink inside footer-socials', () => {
      renderWithTypingComplete()
      const socials = document.querySelector('.footer-socials') as HTMLElement

      expect(socials).toBeInTheDocument()
      ;['GITHUB', 'LINKEDIN', 'EMAIL', 'RESUME'].forEach((label) => {
        const link = within(socials).getByRole('link', { name: `// ${label}` })
        expect(link).toHaveClass('slink')
        expect(link).toHaveTextContent(label)
      })
    })

    it('renders footer social links with the expected destinations', () => {
      render(<ContactSection />)
      const githubLink = screen.getByRole('link', { name: '// GITHUB' })
      const linkedInLink = screen.getByRole('link', { name: '// LINKEDIN' })
      const emailLink = screen.getByRole('link', { name: '// EMAIL' })
      const resumeLink = screen.getByRole('link', { name: '// RESUME' })

      expect(githubLink).toHaveAttribute('href', 'https://github.com/Nemesis-12')
      expect(githubLink).not.toHaveAttribute('target')
      expect(githubLink).not.toHaveAttribute('rel')
      expect(linkedInLink).toHaveAttribute('href', 'https://linkedin.com/in/fa-mohammed')
      expect(linkedInLink).not.toHaveAttribute('target')
      expect(linkedInLink).not.toHaveAttribute('rel')
      expect(emailLink).toHaveAttribute('href', canonicalEmailHref)
      expect(emailLink).not.toHaveAttribute('target')
      expect(emailLink).not.toHaveAttribute('rel')
      expect(resumeLink).toHaveAttribute('href', '/resume.pdf')
      expect(resumeLink).toHaveAttribute('target', '_blank')
      expect(resumeLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('pins footer metadata in footer-copy at the bottom of contact', () => {
      render(<ContactSection />)
      const contact = document.querySelector('#contact') as HTMLElement
      const copy = contact.querySelector('.footer-copy')

      expect(copy).toBeInTheDocument()
      expect(copy).toHaveTextContent('FARHAN_MOHAMMED © 2026')
      expect(copy).toHaveTextContent('PORTFOLIO.EXE')
      expect(contact.lastElementChild).toBe(copy)
    })

    it('marks footer metadata text as a stronger parallax layer', () => {
      render(<ContactSection />)
      const footerText = Array.from(document.querySelectorAll('#contact .footer-copy [data-parallax]'))

      expect(footerText).toHaveLength(2)
      footerText.forEach((item) => {
        expect(item).toHaveAttribute('data-parallax-factor', '0.5')
      })
    })

    it('keeps contact as a stackable sticky surface', () => {
      render(<ContactSection />)
      const contact = document.querySelector('#contact')

      expect(contact?.tagName.toLowerCase()).toBe('footer')
      expect(contact).toHaveAttribute('data-sticky-section', 'true')
      expect(contact).toHaveClass('sticky', 'top-0', 'min-h-screen')
    })
  })
})
