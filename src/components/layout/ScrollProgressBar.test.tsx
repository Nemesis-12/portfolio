import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrollProgressBar } from './ScrollProgressBar'

/**
 * Coverage for issue #312's progress bar: it must register a
 * `requestAnimationFrame` callback and write directly to the element it
 * owns, bypassing React state. Pixel-perfect scroll math is not
 * verifiable in jsdom (no layout engine, `scrollY`/`scrollHeight` are
 * inert) and is not asserted here -- only that the mechanism (rAF, direct
 * style write) is the one described in the spec.
 */
describe('ScrollProgressBar', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>
  let frames: FrameRequestCallback[]

  beforeEach(() => {
    frames = []
    // Capture scheduled callbacks instead of running the real browser
    // frame loop; the test drives one frame explicitly and stops there,
    // rather than letting the component's real (intentional) recursive
    // rAF loop run unbounded inside a mock.
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb)
      return frames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers a requestAnimationFrame callback on mount', () => {
    render(<ScrollProgressBar />)

    expect(rafSpy).toHaveBeenCalled()
  })

  it('writes a percentage width directly to the fill element, not via React state', () => {
    render(<ScrollProgressBar />)

    expect(frames.length).toBeGreaterThan(0)
    act(() => {
      frames[0](0)
    })

    const fill = screen.getByTestId('scroll-progress-fill')
    expect(fill.style.width).toMatch(/^\d+(\.\d+)?%$/)
  })
})
