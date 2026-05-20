import { act, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { StickySection } from './StickySection'

function mockRect(element: Element, top: number) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom: top + 800,
    left: 0,
    right: 1024,
    width: 1024,
    height: 800,
    x: 0,
    y: top,
    toJSON: () => ({}),
  })
}

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

  it('renders as a sharp sticky full-viewport card layer', async () => {
    render(
      <>
        <StickySection id="first">First</StickySection>
        <StickySection id="second">Second</StickySection>
      </>,
    )

    const first = document.getElementById('first')!
    const second = document.getElementById('second')!

    expect(first.className).toContain('sticky')
    expect(first.className).toContain('top-0')
    expect(first.className).toContain('min-h-screen')
    expect(first.className).not.toContain('rounded')
    expect(first.className).not.toContain('blur')
    expect(first.style.borderRadius).toBe('')
    expect(first.style.filter).toBe('')

    await waitFor(() => {
      expect(first.style.zIndex).toBe('1')
      expect(second.style.zIndex).toBe('2')
    })
  })

  it('scales and dims the outgoing section as the next section enters', async () => {
    render(
      <>
        <StickySection id="outgoing">Outgoing</StickySection>
        <StickySection id="incoming">Incoming</StickySection>
      </>,
    )

    const outgoing = document.getElementById('outgoing')!
    const incoming = document.getElementById('incoming')!
    mockRect(incoming, 400)

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    })

    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(outgoing.style.transform).toBe('scale(0.975)')
    expect(outgoing.style.opacity).toBe('0.875')
    expect(outgoing.style.filter).toBe('')
  })

  it('includes footer surfaces in stack depth calculations', async () => {
    render(
      <>
        <StickySection id="contact">Contact</StickySection>
        <StickySection as="footer" id="footer">
          Footer
        </StickySection>
      </>,
    )

    const contact = document.getElementById('contact')!
    const footer = document.getElementById('footer')!
    mockRect(footer, 400)

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    })

    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(contact.style.zIndex).toBe('1')
    expect(footer.style.zIndex).toBe('2')
    expect(contact.style.transform).toBe('scale(0.975)')
    expect(contact.style.opacity).toBe('0.875')
  })

  it('keeps the outgoing section at full depth before the next section enters', async () => {
    render(
      <>
        <StickySection id="outgoing">Outgoing</StickySection>
        <StickySection id="incoming">Incoming</StickySection>
      </>,
    )

    const outgoing = document.getElementById('outgoing')!
    const incoming = document.getElementById('incoming')!
    mockRect(incoming, 900)

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    })

    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(outgoing.style.transform).toBe('scale(1)')
    expect(outgoing.style.opacity).toBe('1')
  })

  it('clamps the outgoing section depth after the next section passes the viewport top', async () => {
    render(
      <>
        <StickySection id="outgoing">Outgoing</StickySection>
        <StickySection id="incoming">Incoming</StickySection>
      </>,
    )

    const outgoing = document.getElementById('outgoing')!
    const incoming = document.getElementById('incoming')!
    mockRect(incoming, -200)

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    })

    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(outgoing.style.transform).toBe('scale(0.95)')
    expect(outgoing.style.opacity).toBe('0.75')
  })

  it('uses the current following sticky section after sections change', async () => {
    const { rerender } = render(
      <>
        <StickySection id="outgoing">Outgoing</StickySection>
        <StickySection id="original-incoming">Original Incoming</StickySection>
      </>,
    )

    rerender(
      <>
        <StickySection id="outgoing">Outgoing</StickySection>
        <StickySection id="new-incoming">New Incoming</StickySection>
        <StickySection id="original-incoming">Original Incoming</StickySection>
      </>,
    )

    const outgoing = document.getElementById('outgoing')!
    const newIncoming = document.getElementById('new-incoming')!
    const originalIncoming = document.getElementById('original-incoming')!
    mockRect(newIncoming, 400)
    mockRect(originalIncoming, 800)

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    })

    await act(async () => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(outgoing.style.transform).toBe('scale(0.975)')
    expect(outgoing.style.opacity).toBe('0.875')
  })
})
