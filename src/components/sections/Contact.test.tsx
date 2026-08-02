import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Contact } from './Contact'
import { CONTACT_LINKS, CONTACT_STATEMENT } from '@/data/contact'
import { sections } from '@/data/sections'

/**
 * Behaviour-only coverage for issue #321: the section landmark, the
 * closing statement, and each link's accessible name, href, and
 * new-tab/external behaviour. No assertions on class names or layout --
 * per repo test philosophy, public interfaces only.
 */
describe('Contact', () => {
  it('renders the contact section with its documented id and label', () => {
    render(<Contact />)

    const region = screen.getByRole('region', { name: sections[5].label })
    expect(region).toHaveAttribute('id', sections[5].id)
  })

  it('states what work is being sought', () => {
    render(<Contact />)

    expect(screen.getByText(CONTACT_STATEMENT)).toBeInTheDocument()
  })

  it('links to email, GitHub, LinkedIn, and the résumé with correct hrefs', () => {
    render(<Contact />)

    for (const link of CONTACT_LINKS) {
      const anchor = screen.getByRole('link', { name: new RegExp(link.label, 'i') })
      expect(anchor).toHaveAttribute('href', link.href)
    }
  })

  it('opens external destinations in a new tab, and keeps email in-page', () => {
    render(<Contact />)

    const email = screen.getByRole('link', { name: /email/i })
    expect(email).not.toHaveAttribute('target')

    for (const link of CONTACT_LINKS.filter((l) => l.external)) {
      const anchor = screen.getByRole('link', { name: new RegExp(link.label, 'i') })
      expect(anchor).toHaveAttribute('target', '_blank')
      expect(anchor).toHaveAttribute('rel', 'noreferrer')
    }
  })

  it('opens the résumé link at the tracked PDF served from public/', () => {
    render(<Contact />)

    const resume = screen.getByRole('link', { name: /résumé/i })
    expect(resume).toHaveAttribute('href', '/resume.pdf')
  })
})
