import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import { useInView } from 'framer-motion'
import ContactSection from './ContactSection'

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return { ...actual, useInView: vi.fn().mockReturnValue(false) }
})

const canonicalEmailHref = 'mailto:famohammed@shockers.wichita.edu'

describe('ContactSection', () => {

  beforeEach(() => {
    vi.mocked(useInView).mockReturnValue(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a contact section with only the CTA heading and send message link', () => {
    vi.mocked(useInView).mockReturnValue(true)
    vi.useFakeTimers()
    render(<ContactSection />)
    act(() => { vi.advanceTimersByTime(1000) })
    const section = document.querySelector('#contact') as HTMLElement

    expect(section).toBeInTheDocument()
    expect(section).toHaveTextContent("LET'S CONNECT.")

    const links = within(section).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'SEND_MESSAGE →',
    ])

    expect(section).not.toHaveTextContent('// GITHUB')
    expect(section).not.toHaveTextContent('// LINKEDIN')
    expect(section).not.toHaveTextContent('// EMAIL')
    expect(section).not.toHaveTextContent('// RESUME')
    expect(section).not.toHaveTextContent('FARHAN_MOHAMMED © 2026')
    expect(section).not.toHaveTextContent('PORTFOLIO.EXE')
  })

  it('renders the send message link with the expected destination', () => {
    vi.mocked(useInView).mockReturnValue(true)
    vi.useFakeTimers()
    render(<ContactSection />)
    act(() => { vi.advanceTimersByTime(1000) })
    const sendMessageLink = screen.getByRole('link', { name: 'SEND_MESSAGE →' })

    expect(sendMessageLink).toHaveAttribute('href', canonicalEmailHref)
  })

  it('renders footer link prefixes in orange and transitions the full link to white on hover', () => {
    vi.mocked(useInView).mockReturnValue(true)
    vi.useFakeTimers()
    render(<ContactSection />)
    act(() => { vi.advanceTimersByTime(1000) })
    const footerLinks = ['// GITHUB', '// LINKEDIN', '// EMAIL', '// RESUME'].map((name) =>
      screen.getByRole('link', { name }),
    )

    footerLinks.forEach((link) => {
      const spans = link.querySelectorAll('span')
      const [prefix, label] = spans

      expect(link).toHaveClass('group')
      expect(spans).toHaveLength(2)
      expect(prefix).toHaveTextContent('//')
      expect(prefix).toHaveClass('text-atomic-tangerine', 'group-hover:text-white', 'transition-colors')
      expect(label).toHaveClass('text-periwinkle', 'group-hover:text-white', 'transition-colors')
    })
  })

  describe('issue #87 - LET\'S CONNECT. typewriter', () => {
    it('heading is not visible when section is out of view', () => {
      vi.mocked(useInView).mockReturnValue(false)
      render(<ContactSection />)

      expect(screen.queryByText("LET'S CONNECT.")).not.toBeInTheDocument()
    })

    it('heading types out character by character when section enters viewport', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      render(<ContactSection />)

      // 5 chars × 50ms = 250ms for "LET'S"
      act(() => { vi.advanceTimersByTime(250) })
      expect(screen.getByText("LET'S")).toBeInTheDocument()

      // 14 chars × 50ms = 700ms for full text
      act(() => { vi.advanceTimersByTime(500) })
      expect(screen.getByText("LET'S CONNECT.")).toBeInTheDocument()
    })

    it('blinking cursor persists after typing completes', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      render(<ContactSection />)

      // Wait for typing to complete: "LET'S CONNECT." = 14 chars × 50ms = 700ms + buffer
      act(() => { vi.advanceTimersByTime(1000) })

      const cursor = document.querySelector('[data-testid="contact-cursor"]')
      expect(cursor).toBeInTheDocument()
      expect(cursor).toHaveClass('bg-atomic-tangerine')
    })
  })
})

describe('Footer', () => {
  it('renders a separate footer with social links and static labels', () => {
    render(<ContactSection />)
    const section = document.querySelector('#contact')
    const footer = document.querySelector('footer')

    expect(footer).toBeInTheDocument()
    expect(section?.nextElementSibling).toBe(footer)
    expect(footer).toHaveTextContent('FARHAN_AHMED_MOHAMMED © 2026')
    expect(footer).toHaveTextContent('PORTFOLIO.EXE')
    expect(footer).toHaveTextContent('// GITHUB')
    expect(footer).toHaveTextContent('// LINKEDIN')
    expect(footer).toHaveTextContent('// EMAIL')
    expect(footer).toHaveTextContent('// RESUME')
    expect(footer).not.toHaveTextContent("LET'S CONNECT.")
    expect(footer).not.toHaveTextContent('SEND_MESSAGE →')
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

  it('marks footer text as a stronger parallax layer', () => {
    render(<ContactSection />)
    const footerText = Array.from(document.querySelectorAll('footer [data-parallax]'))

    expect(footerText).toHaveLength(2)
    footerText.forEach((item) => {
      expect(item).toHaveAttribute('data-parallax-factor', '0.5')
    })
  })
})
