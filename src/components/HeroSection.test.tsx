import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroSection from './HeroSection'

describe('HeroSection', () => {
  it('shows the developer name', () => {
    render(<HeroSection />)
    expect(screen.getByText('FARHAN MOHAMMED')).toBeInTheDocument()
  })

  it('shows the subtitle', () => {
    render(<HeroSection />)
    expect(screen.getByText('CS_STUDENT · DEVELOPER')).toBeInTheDocument()
  })

  it('shows the VIEW_WORK call-to-action linking to projects section', () => {
    render(<HeroSection />)
    const link = screen.getByRole('link', { name: /VIEW_WORK →/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#projects')
  })
})
