import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Clock } from './Clock'

/**
 * Coverage for issue #312's clock requirements: it ticks under normal
 * motion, and "settles rather than flickers" under a reduced-motion
 * preference -- concretely, no per-second tick is ever started, so the
 * displayed time never changes after mount.
 */

function stubMatchMedia(reducedMotion: boolean) {
  const mql: Partial<MediaQueryList> = {
    matches: reducedMotion,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue(mql as MediaQueryList),
  )
}

describe('Clock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-28T10:15:30'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('displays the current time', () => {
    stubMatchMedia(false)
    render(<Clock />)

    expect(screen.getByText('10:15:30')).toBeInTheDocument()
  })

  it('ticks forward once a second under normal motion', () => {
    stubMatchMedia(false)
    render(<Clock />)

    expect(screen.getByText('10:15:30')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByText('10:15:33')).toBeInTheDocument()
  })

  it('does not tick under prefers-reduced-motion: reduce -- it settles at mount time', () => {
    stubMatchMedia(true)
    render(<Clock />)

    expect(screen.getByText('10:15:30')).toBeInTheDocument()

    vi.advanceTimersByTime(10_000)

    // Still the mount-time reading -- no interval was ever registered.
    expect(screen.getByText('10:15:30')).toBeInTheDocument()
  })
})
