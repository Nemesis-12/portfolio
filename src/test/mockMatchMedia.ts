import { vi } from 'vitest'

/**
 * Installs a `window.matchMedia` stub that reports `reduced` for
 * `(prefers-reduced-motion: reduce)` and `false` for anything else --
 * enough for components that branch on `useReducedMotion()` without
 * pulling in a full media-query engine.
 */
export function mockMatchMedia(reduced: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}
