import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import ContactSection from './ContactSection'

describe('ContactSection', () => {
  const canonicalEmailHref = 'mailto:famohammed@shockers.wichita.edu'

  it('renders a contact section with only the CTA heading and contact links', () => {
    render(<ContactSection />)
    const section = document.querySelector('#contact') as HTMLElement

    expect(section).toBeInTheDocument()
    expect(within(section).getByRole('heading', { name: /LET'S CONNECT\./i })).toBeInTheDocument()

    const links = within(section).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual([
      'SEND_MESSAGE →',
      '// GITHUB',
      '// LINKEDIN',
      '// EMAIL',
      '// RESUME',
    ])

    expect(section).not.toHaveTextContent('// 04 CONTACT')
    expect(section).not.toHaveTextContent('FARHAN_MOHAMMED © 2026')
    expect(section).not.toHaveTextContent('PORTFOLIO.EXE')
  })

  it('renders contact links with the expected destinations', () => {
    render(<ContactSection />)
    const sendMessageLink = screen.getByRole('link', { name: 'SEND_MESSAGE →' })
    const githubLink = screen.getByRole('link', { name: '// GITHUB' })
    const linkedInLink = screen.getByRole('link', { name: '// LINKEDIN' })
    const emailLink = screen.getByRole('link', { name: '// EMAIL' })
    const resumeLink = screen.getByRole('link', { name: '// RESUME' })

    expect(sendMessageLink).toHaveAttribute('href', canonicalEmailHref)
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

  it('renders footer link prefixes in orange and transitions the full link to white on hover', () => {
    render(<ContactSection />)
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
})

describe('Footer', () => {
  it('renders a separate footer with only static labels', () => {
    render(<ContactSection />)
    const section = document.querySelector('#contact')
    const footer = document.querySelector('footer')

    expect(footer).toBeInTheDocument()
    expect(section?.nextElementSibling).toBe(footer)
    expect(footer).toHaveTextContent('FARHAN_MOHAMMED © 2026')
    expect(footer).toHaveTextContent('PORTFOLIO.EXE')
    expect(Array.from(footer?.children ?? []).map((child) => child.textContent)).toEqual([
      'FARHAN_MOHAMMED © 2026',
      'PORTFOLIO.EXE',
    ])
    expect(footer).not.toHaveTextContent("LET'S CONNECT.")
    expect(footer).not.toHaveTextContent('SEND_MESSAGE →')
    expect(footer?.querySelectorAll('a, button, input, select, textarea, [tabindex]').length).toBe(0)
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
