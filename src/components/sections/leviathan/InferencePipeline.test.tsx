import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InferencePipeline } from './InferencePipeline'

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
  vi.useRealTimers()
})

describe('InferencePipeline', () => {
  it('renders as a labelled group covering every stage, including the chess position display', () => {
    render(<InferencePipeline />)

    const panel = screen.getByRole('group', {
      name: 'Inference pipeline: position to tokens to attention to policy to move',
    })
    expect(panel).toBeInTheDocument()

    // Each pipeline stage has a visible row label -- the position display
    // (the engine's own chess input) is one of them, distinct from the cut
    // hero chess replay.
    expect(screen.getByText('position')).toBeInTheDocument()
    expect(screen.getByText('tokens')).toBeInTheDocument()
    expect(screen.getByText('attention')).toBeInTheDocument()
    expect(screen.getByText('policy')).toBeInTheDocument()
    expect(screen.getByText('move')).toBeInTheDocument()
  })

  it('starts a timer under normal motion preferences', () => {
    mockMatchMedia(false)
    vi.useFakeTimers()
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')

    render(<InferencePipeline />)

    expect(setIntervalSpy).toHaveBeenCalled()
  })

  it('settles on one fully-resolved frame under reduced motion, without starting a timer', () => {
    mockMatchMedia(true)
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')

    render(<InferencePipeline />)

    expect(setIntervalSpy).not.toHaveBeenCalled()
    // The settled frame is fully resolved: the move stage has an actual
    // move rendered, not the pre-reveal placeholder.
    expect(screen.queryByText('···')).not.toBeInTheDocument()
  })
})
