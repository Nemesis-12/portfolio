import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockMatchMedia } from '@/test/mockMatchMedia'
import { HeroTagline } from './HeroTagline'

const TEXT = 'I build things that are fun.'

describe('HeroTagline', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the full tagline immediately under reduced motion, starting no reveal timer', () => {
    mockMatchMedia(true)
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

    render(<HeroTagline text={TEXT} />)

    expect(screen.getByText(TEXT)).toBeInTheDocument()
    expect(rafSpy).not.toHaveBeenCalled()
  })

  it('starts a reveal timer when motion is not reduced', () => {
    mockMatchMedia(false)
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

    render(<HeroTagline text={TEXT} />)

    expect(rafSpy).toHaveBeenCalled()
  })
})
