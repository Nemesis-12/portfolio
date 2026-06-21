import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { TypeIn } from './TypeIn'

describe('TypeIn', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('given start=false, renders nothing', () => {
    render(<TypeIn start={false} text="Hello World" />)
    expect(screen.queryByText('Hello World')).not.toBeInTheDocument()
  })

  it('emits characters one at a time when start=true', () => {
    render(<TypeIn start={true} text="AB" />)
    
    act(() => { vi.advanceTimersByTime(45) })
    expect(screen.getByText('A')).toBeInTheDocument()
    
    act(() => { vi.advanceTimersByTime(45) })
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('calls onDone when typing completes', () => {
    const onDone = vi.fn()
    render(<TypeIn start={true} text="X" onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(100) })
    
    // X is 1 char at 40ms = 40ms + buffer
    expect(onDone).toHaveBeenCalled()
  })

  it('does not call onDone if start stays false', () => {
    const onDone = vi.fn()
    render(<TypeIn start={false} text="Hello" onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(10000) })

    expect(onDone).not.toHaveBeenCalled()
  })

  it('cleans up on unmount', () => {
    const onDone = vi.fn()
    const { unmount } = render(<TypeIn start={true} text="Hello" onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(20) })
    unmount()
    act(() => { vi.advanceTimersByTime(1000) })

    expect(onDone).not.toHaveBeenCalled()
  })

  it('calls onDone immediately for empty text when start=true', () => {
    const onDone = vi.fn()
    render(<TypeIn start={true} text="" onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(10) })

    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('renders empty span for empty text when start=true', () => {
    const { container } = render(<TypeIn start={true} text="" />)

    expect(container.querySelector('span')).toHaveTextContent('')
  })

  it('respects custom speed prop', () => {
    render(<TypeIn start={true} text="AB" speed={100} />)

    act(() => { vi.advanceTimersByTime(50) })
    expect(screen.queryByText('A')).not.toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(60) })
    expect(screen.getByText('A')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('calls onDone exactly once, not multiple times', () => {
    const onDone = vi.fn()
    render(<TypeIn start={true} text="AB" onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(200) })
    expect(onDone).toHaveBeenCalledTimes(1)

    act(() => { vi.advanceTimersByTime(500) })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('restarts animation when start flips false then true', () => {
    const { rerender } = render(<TypeIn start={true} text="ABC" />)

    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.getByText('AB')).toBeInTheDocument()

    rerender(<TypeIn start={false} text="ABC" />)
    expect(screen.queryByText('AB')).not.toBeInTheDocument()

    rerender(<TypeIn start={true} text="ABC" />)

    act(() => { vi.advanceTimersByTime(45) })
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('restarts with new text when text prop changes mid-animation', () => {
    const { rerender } = render(<TypeIn start={true} text="Hello" />)

    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.getByText('He')).toBeInTheDocument()

    rerender(<TypeIn start={true} text="XYZ" />)

    act(() => { vi.advanceTimersByTime(45) })
    expect(screen.getByText('X')).toBeInTheDocument()
  })

  it('handles special characters correctly', () => {
    const specialText = '<>&"\''
    render(<TypeIn start={true} text={specialText} />)

    act(() => { vi.advanceTimersByTime(250) })
    expect(screen.getByText(specialText)).toBeInTheDocument()
  })

  it('does not restart animation when onDone reference changes between renders', () => {
    const onDone = vi.fn()
    const { rerender } = render(<TypeIn start={true} text="Hello" onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(80) })
    expect(screen.getByText('He')).toBeInTheDocument()

    const newOnDone = vi.fn()
    rerender(<TypeIn start={true} text="Hello" onDone={newOnDone} />)

    act(() => { vi.advanceTimersByTime(45) })
    expect(screen.getByText('Hel')).toBeInTheDocument()
  })

  it('calls the latest onDone when typing completes after onDone reference changes', () => {
    const firstOnDone = vi.fn()
    const { rerender } = render(<TypeIn start={true} text="Hi" onDone={firstOnDone} />)

    act(() => { vi.advanceTimersByTime(45) })

    const latestOnDone = vi.fn()
    rerender(<TypeIn start={true} text="Hi" onDone={latestOnDone} />)

    act(() => { vi.advanceTimersByTime(45) })

    expect(firstOnDone).not.toHaveBeenCalled()
    expect(latestOnDone).toHaveBeenCalledTimes(1)
  })

  it('does not start typing until the delay elapses', () => {
    render(<TypeIn start={true} text="AB" delay={200} />)

    act(() => { vi.advanceTimersByTime(150) })
    expect(screen.queryByText('A')).not.toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(50) })
    act(() => { vi.advanceTimersByTime(40) })
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('types at the given speed after the delay elapses', () => {
    render(<TypeIn start={true} text="AB" speed={40} delay={200} />)

    act(() => { vi.advanceTimersByTime(200) })
    act(() => { vi.advanceTimersByTime(40) })
    expect(screen.getByText('A')).toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(40) })
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('does not call onDone before the delay plus typing duration elapses', () => {
    const onDone = vi.fn()
    render(<TypeIn start={true} text="X" speed={40} delay={200} onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(200) })
    expect(onDone).not.toHaveBeenCalled()

    act(() => { vi.advanceTimersByTime(40) })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('cleans up the delay timeout on unmount before it fires', () => {
    const onDone = vi.fn()
    const { unmount } = render(<TypeIn start={true} text="Hello" delay={200} onDone={onDone} />)

    act(() => { vi.advanceTimersByTime(100) })
    unmount()
    act(() => { vi.advanceTimersByTime(1000) })

    expect(onDone).not.toHaveBeenCalled()
  })

  it('restarts the delay when start flips false then true', () => {
    const { rerender } = render(<TypeIn start={true} text="AB" delay={200} />)

    act(() => { vi.advanceTimersByTime(100) })
    rerender(<TypeIn start={false} text="AB" delay={200} />)
    rerender(<TypeIn start={true} text="AB" delay={200} />)

    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.queryByText('A')).not.toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(100) })
    act(() => { vi.advanceTimersByTime(40) })
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('defaults delay to 0 so timing matches the no-delay case', () => {
    render(<TypeIn start={true} text="AB" />)

    act(() => { vi.advanceTimersByTime(45) })
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
