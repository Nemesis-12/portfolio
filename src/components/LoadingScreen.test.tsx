import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import LoadingScreen from './LoadingScreen'

const MESSAGE_DURATION = 600

describe('LoadingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows ESTABLISHING_SIGNAL as the first status message', () => {
    const { getByText } = render(<LoadingScreen onComplete={vi.fn()} />)
    expect(getByText('ESTABLISHING_SIGNAL')).toBeInTheDocument()
  })

  it('cycles through all status messages in sequence', async () => {
    const { getByText } = render(<LoadingScreen onComplete={vi.fn()} />)

    expect(getByText('ESTABLISHING_SIGNAL')).toBeInTheDocument()

    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    expect(getByText('COMPILING_MODULES')).toBeInTheDocument()

    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    expect(getByText('LOADING_ASSETS')).toBeInTheDocument()

    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    expect(getByText('SYSTEM_READY')).toBeInTheDocument()
  })

  it('calls onComplete after the final message', async () => {
    const onComplete = vi.fn()
    render(<LoadingScreen onComplete={onComplete} />)

    // Each act() flushes React state so the next timer gets scheduled
    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))

    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('does not call onComplete before the final message', async () => {
    const onComplete = vi.fn()
    render(<LoadingScreen onComplete={onComplete} />)

    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('progress bar steps from 25% to 100% across all messages', async () => {
    const { getByRole } = render(<LoadingScreen onComplete={vi.fn()} />)
    const bar = getByRole('progressbar')

    expect(bar).toHaveAttribute('aria-valuenow', '25')

    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    expect(bar).toHaveAttribute('aria-valuenow', '50')

    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    expect(bar).toHaveAttribute('aria-valuenow', '75')

    await act(() => vi.advanceTimersByTime(MESSAGE_DURATION))
    expect(bar).toHaveAttribute('aria-valuenow', '100')
  })
})
