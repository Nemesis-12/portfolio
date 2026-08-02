import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '@/test/mockMatchMedia'
import { GoBoardReplay } from './GoBoardReplay'

/**
 * Seam: what jsdom can honestly observe about the hero board (issue #316).
 * Frame-by-frame appearance and animation smoothness are browser-only and
 * are not asserted here -- the real correctness weight sits on the pure
 * `goTiming`/`goFrameModel` modules' headless tests. This file only checks
 * the public, observable contract: both player names and the move number
 * render, and reduced motion means no timer is ever started.
 */
describe('GoBoardReplay', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders both player names and the final move number under reduced motion, starting no timer', () => {
    mockMatchMedia(true)
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

    render(<GoBoardReplay />)

    expect(screen.getByText(/LEE SEDOL/)).toBeInTheDocument()
    expect(screen.getByText(/ALPHAGO/)).toBeInTheDocument()
    expect(screen.getByText('MOVE 180')).toBeInTheDocument()
    expect(rafSpy).not.toHaveBeenCalled()
  })

  it('renders the final position as an accessible image labelled with move 180 of 180', () => {
    mockMatchMedia(true)

    render(<GoBoardReplay />)

    expect(screen.getByRole('img', { name: /move 180 of 180/i })).toBeInTheDocument()
  })

  it('starts an animation timer when motion is not reduced', () => {
    mockMatchMedia(false)
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

    render(<GoBoardReplay />)

    expect(rafSpy).toHaveBeenCalled()
  })

  it('shows the game caption alongside the board', () => {
    mockMatchMedia(true)

    render(<GoBoardReplay />)

    expect(screen.getByText(/GAME 4.*2016.*WHITE WINS BY RESIGNATION/)).toBeInTheDocument()
  })
})
