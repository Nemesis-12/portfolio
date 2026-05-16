import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollFadeSection } from './ScrollFadeSection'

/**
 * Tests for ScrollFadeSection component.
 * Verifies children rendering and initial animation states.
 */
describe('ScrollFadeSection', () => {
  /** Verifies that child content is rendered inside the section. */
  it('renders children inside the section', () => {
    render(<ScrollFadeSection id="hero">Hello World</ScrollFadeSection>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('starts with opacity 0 before scrolling into view', () => {
    render(<ScrollFadeSection id="test-section">content</ScrollFadeSection>)
    const section = document.getElementById('test-section')!
    expect(section).toHaveStyle({ opacity: '0' })
  })

  it('starts at translateY 24px before scrolling into view', () => {
    render(<ScrollFadeSection id="test-section">content</ScrollFadeSection>)
    const section = document.getElementById('test-section')!
    expect(section.style.transform).toContain('translateY(24px)')
  })
})
