import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContactSection from './ContactSection'

describe('ContactSection', () => {
  it('renders the // 04 CONTACT section label', () => {
    render(<ContactSection />)
    expect(screen.getByText('// 04 CONTACT')).toBeInTheDocument()
  })

  it('renders LET\'S CONNECT. as an h2 heading', () => {
    render(<ContactSection />)
    const heading = screen.getByRole('heading', { name: /LET'S CONNECT\./i })
    expect(heading).toBeInTheDocument()
  })

  it('renders SEND_MESSAGE → as a mailto link', () => {
    render(<ContactSection />)
    const link = screen.getByRole('link', { name: /SEND_MESSAGE →/ })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', expect.stringMatching(/^mailto:/))
  })

  it('renders footer links: GITHUB, LINKEDIN, EMAIL, RESUME', () => {
    render(<ContactSection />)
    expect(screen.getByText('// GITHUB')).toBeInTheDocument()
    expect(screen.getByText('// LINKEDIN')).toBeInTheDocument()
    expect(screen.getByText('// EMAIL')).toBeInTheDocument()
    expect(screen.getByText('// RESUME')).toBeInTheDocument()
  })

  it('renders resume link with target="_blank" pointing to resume.pdf', () => {
    render(<ContactSection />)
    const resumeLink = screen.getByText('// RESUME').closest('a')
    expect(resumeLink).toHaveAttribute('href', '/resume.pdf')
    expect(resumeLink).toHaveAttribute('target', '_blank')
  })
})

describe('Footer', () => {
  it('renders copyright with FARHAN_MOHAMMED © 2026', () => {
    render(<ContactSection />)
    expect(screen.getByText(/FARHAN_MOHAMMED © 2026/)).toBeInTheDocument()
  })

  it('renders PORTFOLIO.EXE label', () => {
    render(<ContactSection />)
    expect(screen.getByText('PORTFOLIO.EXE')).toBeInTheDocument()
  })

  it('renders a footer element', () => {
    render(<ContactSection />)
    const footer = document.querySelector('footer')
    expect(footer).toBeInTheDocument()
  })

  it('footer contains no anchor elements', () => {
    render(<ContactSection />)
    const footer = document.querySelector('footer')
    const links = footer?.querySelectorAll('a')
    expect(links?.length).toBe(0)
  })
})
