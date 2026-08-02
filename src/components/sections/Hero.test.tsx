import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '@/test/mockMatchMedia'
import { HERO_ROLE, HERO_TAGLINE } from '@/data/hero'
import { Hero } from './Hero'

/**
 * Public-interface coverage for the hero (issue #316): the role, the
 * name, and the tagline all render, and under reduced motion the board's
 * caption/move-number information is present with no animation running.
 * The board's own timing/model correctness is covered exhaustively by
 * src/lib/hero/*.test.ts; this only checks the section composes them.
 */
describe('Hero', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows the role, the name, and the tagline', () => {
    mockMatchMedia(true)

    render(<Hero />)

    expect(screen.getByText(HERO_ROLE)).toBeInTheDocument()
    expect(screen.getByText('FARHAN')).toBeInTheDocument()
    expect(screen.getByText('MOHAMMED')).toBeInTheDocument()
    expect(screen.getByText(HERO_TAGLINE)).toBeInTheDocument()
  })

  it('shows the Go board with both player names and a move number', () => {
    mockMatchMedia(true)

    render(<Hero />)

    expect(screen.getByText(/LEE SEDOL/)).toBeInTheDocument()
    expect(screen.getByText(/ALPHAGO/)).toBeInTheDocument()
    expect(screen.getByText(/^MOVE \d+$/)).toBeInTheDocument()
  })
})
