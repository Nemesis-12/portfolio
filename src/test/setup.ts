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
