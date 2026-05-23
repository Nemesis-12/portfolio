import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StickySection } from './StickySection'

describe('StickySection', () => {
  it('renders children inside the section', () => {
    render(<StickySection id="hero">Hello World</StickySection>)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('can render as a footer surface', () => {
    render(
      <StickySection as="footer" id="footer">
        Footer
      </StickySection>,
    )

    expect(document.getElementById('footer')?.tagName.toLowerCase()).toBe('footer')
  })

  it('renders as a full-viewport major section without sticky card-deck behavior', () => {
    render(
      <>
        <StickySection id="first">First</StickySection>
        <StickySection id="second">Second</StickySection>
      </>,
    )

    const first = document.getElementById('first')!
    const second = document.getElementById('second')!

    expect(first.className).toContain('min-h-screen')
    expect(first.className).not.toContain('sticky')
    expect(first.className).not.toContain('top-0')
    expect(first).not.toHaveAttribute('data-sticky-section')
    expect(first.style.transform).toBe('')
    expect(first.style.opacity).toBe('')
    expect(first.style.zIndex).toBe('')

    expect(second.className).toContain('min-h-screen')
    expect(second).not.toHaveAttribute('data-sticky-section')
  })
})
