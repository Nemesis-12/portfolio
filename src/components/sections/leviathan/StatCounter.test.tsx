import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StatCounter } from './StatCounter'
import type { LeviathanStat } from '@/data/leviathan'

const stat: LeviathanStat = {
  id: 'latency',
  target: 19,
  suffix: 'ms',
  label: 'PER MOVE',
  accessibleName: '19 milliseconds per move',
}

function mockMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('StatCounter', () => {
  /**
   * jsdom has no IntersectionObserver at all (it's `undefined`, not a
   * stub) -- this is the default test environment, so this case is
   * covered by every other test in this file too. It is asserted
   * explicitly here: mounting must not throw, and the accessible name
   * must carry the real, final figure immediately.
   */
  it('shows the full accessible figure immediately when IntersectionObserver is unavailable (the default jsdom environment)', () => {
    expect(window.IntersectionObserver).toBeUndefined()

    render(<StatCounter stat={stat} />)

    expect(screen.getByRole('group', { name: '19 milliseconds per move' })).toBeInTheDocument()
  })

  it('shows the target immediately under a reduced-motion preference, without creating an observer', () => {
    mockMatchMedia(true)
    const ObserverSpy = vi.fn()
    vi.stubGlobal('IntersectionObserver', ObserverSpy)

    render(<StatCounter stat={stat} />)

    expect(screen.getByRole('group', { name: '19 milliseconds per move' })).toBeInTheDocument()
    expect(ObserverSpy).not.toHaveBeenCalled()
  })

  it('observes the stat element when IntersectionObserver is available and motion is not reduced', () => {
    mockMatchMedia(false)
    const observe = vi.fn()
    const disconnect = vi.fn()
    class FakeIntersectionObserver {
      observe = observe
      unobserve = vi.fn()
      disconnect = disconnect
      constructor() {}
    }
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)

    const { unmount } = render(<StatCounter stat={stat} />)

    // The accessible name is present immediately regardless of whether the
    // count-up animation has run -- it never depends on animation state.
    expect(screen.getByRole('group', { name: '19 milliseconds per move' })).toBeInTheDocument()
    expect(observe).toHaveBeenCalledTimes(1)

    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
