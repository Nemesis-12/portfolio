import '@testing-library/jest-dom/vitest'

// jsdom does not implement IntersectionObserver; Framer Motion's whileInView requires it
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})
