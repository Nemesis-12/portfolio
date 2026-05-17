import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroSection, { cursorVariants } from './HeroSection'

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

  it('shows a blinking cursor after the name', () => {
    render(<HeroSection />)
    const heading = screen.getByRole('heading', { name: 'FARHAN MOHAMMED' })
    const cursor = screen.getByTestId('cursor')

    expect(cursor).toBeInTheDocument()
    expect(cursor).toHaveClass('bg-atomic-tangerine')
    expect(cursor).toHaveClass('w-[3px]')
    expect(cursor.previousSibling?.textContent).toBe('FARHAN MOHAMMED')
    expect(heading.lastElementChild).toBe(cursor)
  })

  it('uses a step-like one-second blink animation for the cursor', () => {
    const blink = cursorVariants.blink

    expect(blink).toMatchObject({
      opacity: [1, 1, 0, 0, 1],
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity,
        times: [0, 0.49, 0.5, 0.99, 1],
      },
    })
  })
})
