import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startIntervalTick } from './intervalTick'

describe('startIntervalTick', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls the callback every delayMs', () => {
    const callback = vi.fn()
    startIntervalTick(callback, 100)

    vi.advanceTimersByTime(350)

    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('does not call the callback before the first delay elapses', () => {
    const callback = vi.fn()
    startIntervalTick(callback, 100)

    vi.advanceTimersByTime(99)

    expect(callback).not.toHaveBeenCalled()
  })

  it('stops calling the callback once the returned cancel function runs', () => {
    const callback = vi.fn()
    const cancel = startIntervalTick(callback, 100)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(1)

    cancel()
    vi.advanceTimersByTime(500)

    expect(callback).toHaveBeenCalledTimes(1)
  })
})
