import { afterEach, describe, expect, it, vi } from 'vitest'
import { PANEL_QUERY, queryMatches, subscribeToMediaQuery } from './useMediaQuery'

/**
 * Minimal fake `MediaQueryList`: enough of the `matchMedia` surface
 * (`matches`, `addEventListener('change', ...)`, `removeEventListener`) for
 * `useMediaQuery`'s consumers, plus a `trigger` helper so tests can flip
 * `matches` and fire the same `change` listeners the browser would.
 */
class FakeMediaQueryList {
  matches: boolean
  private listeners = new Set<() => void>()

  constructor(matches: boolean) {
    this.matches = matches
  }

  addEventListener(type: 'change', listener: () => void) {
    if (type === 'change') this.listeners.add(listener)
  }

  removeEventListener(type: 'change', listener: () => void) {
    if (type === 'change') this.listeners.delete(listener)
  }

  trigger(matches: boolean) {
    this.matches = matches
    for (const listener of this.listeners) listener()
  }

  get listenerCount() {
    return this.listeners.size
  }
}

describe('PANEL_QUERY', () => {
  it('is the one 880px breakpoint, expressed as a min-width query', () => {
    expect(PANEL_QUERY).toBe('(min-width: 880px)')
  })
})

describe('queryMatches', () => {
  const originalWindow = globalThis.window

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error -- restoring the no-window (Node test) baseline
      delete globalThis.window
    } else {
      globalThis.window = originalWindow
    }
  })

  it('returns false when window is undefined', () => {
    // @ts-expect-error -- simulating an environment without `window`
    delete globalThis.window
    expect(queryMatches(PANEL_QUERY)).toBe(false)
  })

  it('returns false when matchMedia is not a function', () => {
    // @ts-expect-error -- simulating jsdom's lack of matchMedia
    globalThis.window = {}
    expect(queryMatches(PANEL_QUERY)).toBe(false)
  })

  it('reflects the current match state from matchMedia', () => {
    const mql = new FakeMediaQueryList(true)
    // @ts-expect-error -- stubbing just enough of window for this read
    globalThis.window = { matchMedia: () => mql }
    expect(queryMatches(PANEL_QUERY)).toBe(true)

    mql.trigger(false)
    expect(queryMatches(PANEL_QUERY)).toBe(false)
  })
})

describe('subscribeToMediaQuery', () => {
  const originalWindow = globalThis.window

  afterEach(() => {
    if (originalWindow === undefined) {
      // @ts-expect-error -- restoring the no-window (Node test) baseline
      delete globalThis.window
    } else {
      globalThis.window = originalWindow
    }
  })

  it('returns a no-op cleanup when matchMedia is unavailable', () => {
    // @ts-expect-error -- simulating an environment without matchMedia
    delete globalThis.window
    const onChange = vi.fn()
    const unsubscribe = subscribeToMediaQuery(PANEL_QUERY, onChange)
    expect(() => unsubscribe()).not.toThrow()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls onChange with the new match state on every change', () => {
    const mql = new FakeMediaQueryList(false)
    // @ts-expect-error -- stubbing just enough of window for this subscription
    globalThis.window = { matchMedia: () => mql }

    const onChange = vi.fn()
    subscribeToMediaQuery(PANEL_QUERY, onChange)

    mql.trigger(true)
    expect(onChange).toHaveBeenLastCalledWith(true)

    mql.trigger(false)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it('stops calling onChange after the returned cleanup runs', () => {
    const mql = new FakeMediaQueryList(false)
    // @ts-expect-error -- stubbing just enough of window for this subscription
    globalThis.window = { matchMedia: () => mql }

    const onChange = vi.fn()
    const unsubscribe = subscribeToMediaQuery(PANEL_QUERY, onChange)
    unsubscribe()

    mql.trigger(true)
    expect(onChange).not.toHaveBeenCalled()
    expect(mql.listenerCount).toBe(0)
  })
})
