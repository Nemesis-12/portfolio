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
})
