import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { RotatingRole } from './RotatingRole'

const CS_STUDENT = 'CS_STUDENT'
const DEVELOPER = 'DEVELOPER'
const roles = [CS_STUDENT, DEVELOPER]

describe('RotatingRole', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('types the first role when active', () => {
    render(<RotatingRole roles={roles} active={true} startDelay={1} />)

    act(() => { vi.advanceTimersByTime(55) })
    expect(screen.getByText(/^C$/)).toBeInTheDocument()

    for (let i = 0; i < CS_STUDENT.length - 1; i++) {
      act(() => { vi.advanceTimersByTime(55) })
    }
    expect(screen.getByText(new RegExp(`^${CS_STUDENT}$`))).toBeInTheDocument()
  })

  it('defers the first character until startDelay elapses', () => {
    render(<RotatingRole roles={roles} active={true} startDelay={300} typeSpeed={40} />)

    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.queryByText(/^C$/)).not.toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.getByText(/^C$/)).toBeInTheDocument()
  })

  it('completes type -> hold -> erase cycle and shows second role', () => {
    const { container } = render(<RotatingRole roles={roles} active={true} typeSpeed={40} eraseSpeed={40} holdMs={100} startDelay={1} />)

    for (let i = 0; i <= CS_STUDENT.length; i++) {
      act(() => { vi.advanceTimersByTime(40) })
    }
    expect(container.textContent).toBe(CS_STUDENT)

    act(() => { vi.advanceTimersByTime(100) })
    expect(container.textContent).toBe(CS_STUDENT)

    for (let i = 0; i <= CS_STUDENT.length; i++) {
      act(() => { vi.advanceTimersByTime(40) })
    }

    for (let i = 0; i <= DEVELOPER.length; i++) {
      act(() => { vi.advanceTimersByTime(40) })
    }
    expect(container.textContent).toBe(DEVELOPER)
  })

  it('shows a persistent caret element during typing and hold phases', () => {
    render(<RotatingRole roles={roles} active={true} typeSpeed={40} holdMs={100} startDelay={1} />)
    const container = screen.getByTestId('rotating-role')
    const cursor = container.querySelector('.cursor')

    act(() => { vi.advanceTimersByTime(40) })
    expect(cursor).not.toBeNull()

    for (let i = 1; i < CS_STUDENT.length; i++) {
      act(() => { vi.advanceTimersByTime(40) })
    }
    expect(screen.getByText(new RegExp(`^${CS_STUDENT}$`))).toBeInTheDocument()
    expect(container.querySelector('.cursor')).not.toBeNull()
  })

  it('erases characters in reverse order', () => {
    const { container } = render(<RotatingRole roles={roles} active={true} typeSpeed={40} eraseSpeed={40} holdMs={100} startDelay={1} />)

    for (let i = 0; i <= CS_STUDENT.length; i++) {
      act(() => { vi.advanceTimersByTime(40) })
    }
    act(() => { vi.advanceTimersByTime(100) })

    act(() => { vi.advanceTimersByTime(40) })
    expect(container.textContent).toBe('CS_STUDEN')

    act(() => { vi.advanceTimersByTime(40) })
    expect(container.textContent).toBe('CS_STUDE')
  })

  it('transitions to next role after full cycle', () => {
    render(<RotatingRole roles={[CS_STUDENT, DEVELOPER]} active={true} typeSpeed={40} eraseSpeed={40} holdMs={50} startDelay={1} />)
    const container = screen.getByTestId('rotating-role')

    const fullCycle = () => {
      for (let i = 0; i <= CS_STUDENT.length; i++) act(() => { vi.advanceTimersByTime(40) })
      act(() => { vi.advanceTimersByTime(50) })
      for (let i = 0; i <= CS_STUDENT.length; i++) act(() => { vi.advanceTimersByTime(40) })
      for (let i = 0; i <= DEVELOPER.length; i++) act(() => { vi.advanceTimersByTime(40) })
    }

    fullCycle()
    const text = container.textContent
    expect(text).toBe(DEVELOPER)
  })

  it('fires onFirstCycleComplete once after the second role finishes typing', () => {
    const onFirstCycleComplete = vi.fn()

    render(
      <RotatingRole
        roles={[CS_STUDENT, DEVELOPER]}
        active={true}
        typeSpeed={40}
        eraseSpeed={40}
        holdMs={50}
        startDelay={1}
        onFirstCycleComplete={onFirstCycleComplete}
      />
    )

    for (let i = 0; i <= CS_STUDENT.length; i++) act(() => { vi.advanceTimersByTime(40) })
    act(() => { vi.advanceTimersByTime(50) })
    for (let i = 0; i <= CS_STUDENT.length; i++) act(() => { vi.advanceTimersByTime(40) })
    expect(onFirstCycleComplete).not.toHaveBeenCalled()

    for (let i = 0; i <= DEVELOPER.length; i++) act(() => { vi.advanceTimersByTime(40) })
    expect(onFirstCycleComplete).toHaveBeenCalledTimes(1)

    act(() => { vi.advanceTimersByTime(5000) })
    expect(onFirstCycleComplete).toHaveBeenCalledTimes(1)
  })

  it('calls the latest onFirstCycleComplete after the callback changes mid-cycle', () => {
    const firstCallback = vi.fn()
    const latestCallback = vi.fn()
    const { rerender } = render(
      <RotatingRole
        roles={[CS_STUDENT, DEVELOPER]}
        active={true}
        typeSpeed={40}
        eraseSpeed={40}
        holdMs={50}
        startDelay={1}
        onFirstCycleComplete={firstCallback}
      />
    )

    for (let i = 0; i <= CS_STUDENT.length; i++) act(() => { vi.advanceTimersByTime(40) })

    rerender(
      <RotatingRole
        roles={[CS_STUDENT, DEVELOPER]}
        active={true}
        typeSpeed={40}
        eraseSpeed={40}
        holdMs={50}
        startDelay={1}
        onFirstCycleComplete={latestCallback}
      />
    )

    act(() => { vi.advanceTimersByTime(50) })
    for (let i = 0; i <= CS_STUDENT.length; i++) act(() => { vi.advanceTimersByTime(40) })
    for (let i = 0; i <= DEVELOPER.length; i++) act(() => { vi.advanceTimersByTime(40) })

    expect(firstCallback).not.toHaveBeenCalled()
    expect(latestCallback).toHaveBeenCalledTimes(1)
  })

  it('does not fire onFirstCycleComplete after becoming inactive before completion', () => {
    const onFirstCycleComplete = vi.fn()
    const { rerender } = render(
      <RotatingRole
        roles={[CS_STUDENT, DEVELOPER]}
        active={true}
        typeSpeed={40}
        eraseSpeed={40}
        holdMs={50}
        startDelay={1}
        onFirstCycleComplete={onFirstCycleComplete}
      />
    )

    for (let i = 0; i <= CS_STUDENT.length; i++) act(() => { vi.advanceTimersByTime(40) })
    rerender(
      <RotatingRole
        roles={[CS_STUDENT, DEVELOPER]}
        active={false}
        typeSpeed={40}
        eraseSpeed={40}
        holdMs={50}
        startDelay={1}
        onFirstCycleComplete={onFirstCycleComplete}
      />
    )

    act(() => { vi.advanceTimersByTime(5000) })

    expect(onFirstCycleComplete).not.toHaveBeenCalled()
  })

  it('cleans up timers on unmount', () => {
    const { unmount } = render(<RotatingRole roles={roles} active={true} />)

    for (let i = 0; i < CS_STUDENT.length; i++) {
      act(() => { vi.advanceTimersByTime(40) })
    }

    unmount()

    act(() => { vi.advanceTimersByTime(10000) })
    expect(vi.getTimerCount()).toBe(0)
  })
})
