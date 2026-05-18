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

  it('types to completion when active=true', () => {
    render(<Typewriter active={true} lines={['Hello', 'World']} />)

    act(() => { vi.advanceTimersByTime(30) })
    expect(screen.getByText('H')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(30) })
    expect(screen.getByText('He')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
  })

  it('calls onDone when all lines finish', () => {
    const onDone = vi.fn()
    render(<Typewriter active={true} lines={['A', 'B']} onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(200) })

    expect(onDone).toHaveBeenCalled()
  })

  it('holds current text when active flips false mid-type', () => {
    const { rerender } = render(<Typewriter active={true} lines={['Hello']} />)

    act(() => { vi.advanceTimersByTime(30) })
    expect(screen.getByText('H')).toBeInTheDocument()

    rerender(<Typewriter active={false} lines={['Hello']} />)

    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.getByText('H')).toBeInTheDocument()
  })

  it('resumes from held position when active flips true again', () => {
    const { rerender } = render(<Typewriter active={true} lines={['Hello']} />)

    act(() => { vi.advanceTimersByTime(30) })
    expect(screen.getByText('H')).toBeInTheDocument()

    rerender(<Typewriter active={false} lines={['Hello']} />)

    rerender(<Typewriter active={true} lines={['Hello']} />)

    act(() => { vi.advanceTimersByTime(30) })
    expect(screen.getByText('He')).toBeInTheDocument()
  })

  it('renders each line as its own element', () => {
    render(<Typewriter active={true} lines={['Line 1', 'Line 2']} />)

    act(() => { vi.advanceTimersByTime(400) })

    const line1 = screen.getByText('Line 1')
    const line2 = screen.getByText('Line 2')
    expect(line1).toBeInTheDocument()
    expect(line2).toBeInTheDocument()
  })

  it('cleans up timers on unmount', () => {
    const onDone = vi.fn()
    const { unmount } = render(<Typewriter active={true} lines={['Hello']} onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(20) })
    unmount()
    act(() => { vi.advanceTimersByTime(1000) })

    expect(onDone).not.toHaveBeenCalled()
  })

  it('respects custom speed prop', () => {
    render(<Typewriter active={true} lines={['AB']} speed={100} />)

    act(() => { vi.advanceTimersByTime(50) })
    expect(screen.queryByText('A')).not.toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(60) })
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('does not call onDone when active is false', () => {
    const onDone = vi.fn()
    render(<Typewriter active={false} lines={['Hello']} onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(10000) })

    expect(onDone).not.toHaveBeenCalled()
  })

  it('handles empty lines array', () => {
    const onDone = vi.fn()
    render(<Typewriter active={true} lines={[]} onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(10) })

    expect(onDone).toHaveBeenCalled()
  })

  it('handles single line', () => {
    render(<Typewriter active={true} lines={['Single']} />)

    act(() => { vi.advanceTimersByTime(200) })

    expect(screen.getByText('Single')).toBeInTheDocument()
  })
})