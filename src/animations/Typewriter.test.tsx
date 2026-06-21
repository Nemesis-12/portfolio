import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Typewriter } from './Typewriter'

describe('Typewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('types to completion at the default speed (6ms/char) when active=true', () => {
    render(<Typewriter text="Hello" active={true} />)

    act(() => {
      vi.advanceTimersByTime(6)
    })
    expect(screen.getByText('H', { exact: false })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(6 * 4)
    })
    expect(screen.getByText('Hello', { exact: false })).toBeInTheDocument()
  })

  it('does not start typing until active becomes true', () => {
    const { container } = render(<Typewriter text="Hello" active={false} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(container.textContent).toBe('')
  })

  it('holds current text when active flips false mid-type', () => {
    const { rerender, container } = render(<Typewriter text="Hello" active={true} />)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(container.textContent).toBe('H')

    rerender(<Typewriter text="Hello" active={false} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(container.textContent).toBe('H')
  })

  it('restarts from the beginning when active flips false then true again', () => {
    const { rerender, container } = render(<Typewriter text="Hello" active={true} />)

    act(() => {
      vi.advanceTimersByTime(6 * 2 + 1)
    })
    expect(container.textContent).toBe('Hel')

    rerender(<Typewriter text="Hello" active={false} />)
    rerender(<Typewriter text="Hello" active={true} />)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(container.textContent).toBe('H')
  })

  it('respects a custom delay before typing starts', () => {
    const { container } = render(<Typewriter text="AB" active={true} delay={200} />)

    act(() => {
      vi.advanceTimersByTime(150)
    })
    expect(container.textContent).toBe('')

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(container.textContent).toBe('A')
  })

  it('respects a custom speed prop', () => {
    const { container } = render(<Typewriter text="AB" active={true} speed={100} />)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(container.textContent).toBe('A')

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(container.textContent).toBe('A')

    act(() => {
      vi.advanceTimersByTime(60)
    })
    expect(container.textContent).toBe('AB')
  })

  it('shows a caret while actively typing', () => {
    const { container } = render(<Typewriter text="Hello" active={true} />)

    act(() => {
      vi.advanceTimersByTime(6)
    })

    expect(container.querySelector('.cursor')).not.toBeNull()
  })

  it('hides the caret once typing completes when keepCursor is false', () => {
    const { container } = render(<Typewriter text="Hi" active={true} keepCursor={false} />)

    act(() => {
      vi.advanceTimersByTime(6 * 3)
    })

    expect(container.textContent).toBe('Hi')
    expect(container.querySelector('.cursor')).toBeNull()
  })

  it('keeps the caret visible after typing completes when keepCursor is true', () => {
    const { container } = render(<Typewriter text="Hi" active={true} keepCursor={true} />)

    act(() => {
      vi.advanceTimersByTime(6 * 3)
    })

    expect(container.textContent).toBe('Hi')
    expect(container.querySelector('.cursor')).not.toBeNull()
  })

  it('hides the caret entirely when active is false, even with keepCursor', () => {
    const { rerender, container } = render(<Typewriter text="Hi" active={true} keepCursor={true} />)

    act(() => {
      vi.advanceTimersByTime(6 * 3)
    })
    expect(container.querySelector('.cursor')).not.toBeNull()

    rerender(<Typewriter text="Hi" active={false} keepCursor={true} />)

    expect(container.querySelector('.cursor')).toBeNull()
  })

  it('cleans up timers on unmount', () => {
    const { unmount } = render(<Typewriter text="Hello" active={true} />)

    act(() => {
      vi.advanceTimersByTime(6)
    })
    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(vi.getTimerCount()).toBe(0)
  })

  it('applies the given className to the wrapping span', () => {
    const { container } = render(<Typewriter text="Hi" active={true} className="tl-org" />)

    const span = container.querySelector('span')
    expect(span).toHaveClass('tl-org')
  })

  it('handles empty text gracefully', () => {
    const { container } = render(<Typewriter text="" active={true} />)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(container.textContent).toBe('')
  })
})
