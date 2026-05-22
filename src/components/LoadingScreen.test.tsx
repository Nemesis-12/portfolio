import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import LoadingScreen from './LoadingScreen'
import {
  BOOT_DURATION,
  FADE_OUT_DURATION,
  MESSAGE_INTERVAL,
  STATUS_MESSAGES,
} from './LoadingScreen.constants'

describe('LoadingScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the reference boot sequence timing (2.8s boot + 0.6s fade)', () => {
    expect(BOOT_DURATION).toBe(2800)
    expect(MESSAGE_INTERVAL).toBe(560)
    expect(FADE_OUT_DURATION).toBe(600)
    expect(BOOT_DURATION + FADE_OUT_DURATION).toBeGreaterThanOrEqual(2600)
    expect(BOOT_DURATION + FADE_OUT_DURATION).toBeLessThanOrEqual(3400)
  })

  it('renders #ls root with portfolio.css boot structure', () => {
    const { container } = render(<LoadingScreen onComplete={vi.fn()} />)
    const root = container.querySelector('#ls')

    expect(root).toBeInTheDocument()
    expect(root?.querySelector('.ls-inner')).toBeInTheDocument()
    expect(root?.querySelector('.ls-sys')).toHaveTextContent('SYSTEM_INIT...')
    expect(root?.querySelector('.ls-name')).toHaveTextContent('FARHAN')
    expect(root?.querySelector('.ls-name')).toHaveTextContent('MOHAMMED')
    expect(root?.querySelector('.ls-track .ls-fill')).toBeInTheDocument()
    expect(root?.querySelector('.ls-msg')).toBeInTheDocument()
  })

  it('shows LOADING_ASSETS as the first status message', () => {
    const { container } = render(<LoadingScreen onComplete={vi.fn()} />)
    expect(container.querySelector('.ls-msg')).toHaveTextContent('LOADING_ASSETS')
  })

  it('cycles through all status messages in sequence', async () => {
    const { container } = render(<LoadingScreen onComplete={vi.fn()} />)
    const msg = () => container.querySelector('.ls-msg')

    expect(msg()).toHaveTextContent('LOADING_ASSETS')

    await act(() => vi.advanceTimersByTime(MESSAGE_INTERVAL))
    expect(msg()).toHaveTextContent('COMPILING_MODULES')

    await act(() => vi.advanceTimersByTime(MESSAGE_INTERVAL))
    expect(msg()).toHaveTextContent('ESTABLISHING_SIGNAL')

    await act(() => vi.advanceTimersByTime(MESSAGE_INTERVAL))
    expect(msg()).toHaveTextContent('DECRYPTING_DATA')

    await act(() => vi.advanceTimersByTime(MESSAGE_INTERVAL))
    expect(msg()).toHaveTextContent('SYSTEM_READY')
  })

  it('calls onComplete after boot sequence and fade-out', async () => {
    const onComplete = vi.fn()
    render(<LoadingScreen onComplete={onComplete} />)

    await act(() => vi.advanceTimersByTime(BOOT_DURATION))
    expect(onComplete).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTime(FADE_OUT_DURATION))
    expect(onComplete).toHaveBeenCalledOnce()
  })

  it('does not call onComplete before fade-out completes', async () => {
    const onComplete = vi.fn()
    render(<LoadingScreen onComplete={onComplete} />)

    await act(() => vi.advanceTimersByTime(BOOT_DURATION - 1))
    expect(onComplete).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTime(1))
    expect(onComplete).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTime(FADE_OUT_DURATION - 1))
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('adds the out class when the boot sequence finishes', async () => {
    const { container } = render(<LoadingScreen onComplete={vi.fn()} />)
    const root = container.querySelector('#ls')

    expect(root).not.toHaveClass('out')

    await act(() => vi.advanceTimersByTime(BOOT_DURATION))
    expect(root).toHaveClass('out')
  })

  it('renders a thin orange progress bar fill element', () => {
    const { container } = render(<LoadingScreen onComplete={vi.fn()} />)
    const fill = container.querySelector('.ls-fill')
    expect(fill).toBeInTheDocument()
    expect(fill?.parentElement).toHaveClass('ls-track')
  })

  it('exposes at least three rotating terminal status messages', () => {
    expect(STATUS_MESSAGES.length).toBeGreaterThanOrEqual(3)
  })
})
