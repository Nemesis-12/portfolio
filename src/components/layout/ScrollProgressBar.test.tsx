import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrollProgressBar } from './ScrollProgressBar'

/**
 * Coverage for issue #312's progress bar: it exposes a real
 * `role="progressbar"` accessible surface (public interface), and it
 * updates that surface via a guarded `requestAnimationFrame` callback
 * rather than a perpetual self-rescheduling loop. Pixel-perfect scroll
 * math is not verifiable in jsdom (no layout engine, `scrollY`/
 * `scrollHeight` are inert) and is not asserted here -- only that the
 * mechanism (single guarded rAF per scroll/resize burst, direct
 * style/aria write) is the one described in the spec.
 */
describe('ScrollProgressBar', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>
  let frames: FrameRequestCallback[]

  beforeEach(() => {
    frames = []
    // Capture scheduled callbacks instead of running the real browser
    // frame loop; the test drives frames explicitly rather than letting
    // any recursive rAF loop run unbounded inside a mock.
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb)
      return frames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders an accessible progressbar with a valid initial value', () => {
    render(<ScrollProgressBar />)

    const bar = screen.getByRole('progressbar', { name: 'Scroll progress' })
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar.getAttribute('aria-valuenow')).toMatch(/^\d+$/)
  })

  it('does not schedule a requestAnimationFrame while idle', () => {
    render(<ScrollProgressBar />)

    // Mount computes the initial value synchronously (no rAF needed for
    // that first paint) and registers listeners -- it must not also kick
    // off a self-perpetuating frame loop.
    expect(rafSpy).not.toHaveBeenCalled()
  })

  it('schedules exactly one rAF per scroll event, and updates aria-valuenow inside it', () => {
    render(<ScrollProgressBar />)

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(frames.length).toBe(1)

    // A second scroll event while the first frame is still pending must
    // not queue a second frame.
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(frames.length).toBe(1)

    act(() => {
      frames[0](0)
    })

    const bar = screen.getByRole('progressbar', { name: 'Scroll progress' })
    expect(bar.getAttribute('aria-valuenow')).toMatch(/^\d+$/)

    // Once the pending frame has run, a new scroll event may schedule
    // another one.
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(frames.length).toBe(2)
  })
})
