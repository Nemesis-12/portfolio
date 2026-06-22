import '@testing-library/jest-dom/vitest'
import '../index.css'
import { vi } from 'vitest'

// jsdom doesn't implement IntersectionObserver
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: vi.fn(function MockIO() {
    return { observe: vi.fn(), disconnect: vi.fn(), unobserve: vi.fn() }
  }),
})

// jsdom's requestAnimationFrame resolves on a real (macrotask) timer, which
// makes RAF-throttled scroll/resize handlers (see useScrollProgress,
// useParallax) resolve asynchronously in tests. Run callbacks synchronously
// by default so hooks built on top of rAF stay deterministic under
// `act(() => window.dispatchEvent(...))`; individual tests that need to
// assert on RAF scheduling itself (e.g. App.test.tsx's parallax test) install
// their own `vi.spyOn(window, 'requestAnimationFrame')` for the duration of
// that test, which takes precedence over this default.
let nextRafId = 1
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  configurable: true,
  value: (callback: FrameRequestCallback) => {
    const id = nextRafId++
    callback(performance.now())
    return id
  },
})
Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  configurable: true,
  value: () => {},
})
