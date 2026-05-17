import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import HeroSection from './HeroSection'
import { cursorVariants } from './HeroSection.constants'

describe('HeroSection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('shows the developer name', () => {
    render(<HeroSection />)
    expect(screen.getByText('FARHAN MOHAMMED')).toBeInTheDocument()
  })

  it('subtitle and value prop are empty initially', () => {
    render(<HeroSection />)

    const subtitle = screen.getByTestId('subtitle')
    const valueProp = screen.getByTestId('value-prop')

    expect(subtitle.textContent).toBe('')
    expect(valueProp.textContent).toBe('')
  })

  it('subtitle starts typing after 400ms delay', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(400)
    })

    const subtitle = screen.getByTestId('subtitle')
    expect(subtitle.textContent).toBe('')
    expect(screen.getByTestId('subtitle-cursor')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(60)
    })

    expect(subtitle.textContent).toBe('C')
    expect(subtitle.lastElementChild).toBe(screen.getByTestId('subtitle-cursor'))
  })

  it('subtitle completes at 60ms/char and removes its cursor immediately', () => {
    render(<HeroSection />)
    const subtitleText = 'CS_STUDENT · DEVELOPER'

    act(() => {
      vi.advanceTimersByTime(400)
      vi.advanceTimersByTime(subtitleText.length * 60)
    })

    const subtitle = screen.getByTestId('subtitle')
    expect(subtitle.textContent).toBe(subtitleText)
    expect(screen.queryByTestId('subtitle-cursor')).not.toBeInTheDocument()
  })

  it('value prop waits until subtitle completes plus the 400ms gap before typing', () => {
    render(<HeroSection />)
    const subtitleText = 'CS_STUDENT · DEVELOPER'
    const valueProp = screen.getByTestId('value-prop')

    act(() => {
      vi.advanceTimersByTime(400 + subtitleText.length * 60)
    })

    expect(valueProp.textContent).toBe('')
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(400)
    })

    expect(valueProp.textContent).toBe('')
    expect(screen.getByTestId('value-prop-cursor')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(35)
    })

    expect(valueProp.textContent).toBe('/')
    expect(valueProp.lastElementChild).toBe(screen.getByTestId('value-prop-cursor'))
  })

  it('value prop completes at 35ms/char and removes its cursor immediately', () => {
    render(<HeroSection />)
    const subtitleText = 'CS_STUDENT · DEVELOPER'
    const valuePropText = '// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.'

    act(() => {
      vi.advanceTimersByTime(400 + subtitleText.length * 60 + 400 + valuePropText.length * 35)
    })

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp.textContent).toBe(valuePropText)
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()
  })

  it('cleans up pending typewriter timers when unmounted', () => {
    const { unmount } = render(<HeroSection />)
    const subtitleText = 'CS_STUDENT · DEVELOPER'

    act(() => {
      vi.advanceTimersByTime(400 + subtitleText.length * 60)
    })

    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('shows the VIEW_WORK call-to-action linking to projects section', () => {
    render(<HeroSection />)
    const link = screen.getByRole('link', { name: /VIEW_WORK →/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#projects')
  })

  it('shows a blinking cursor after the name', () => {
    render(<HeroSection />)
    const heading = screen.getByRole('heading', { name: 'FARHAN MOHAMMED' })
    const cursor = screen.getByTestId('cursor')

    expect(cursor).toBeInTheDocument()
    expect(cursor).toHaveClass('bg-atomic-tangerine')
    expect(cursor).toHaveClass('w-[3px]')
    expect(cursor.previousSibling?.textContent).toBe('FARHAN MOHAMMED')
    expect(heading.lastElementChild).toBe(cursor)
  })

  it('uses a step-like one-second blink animation for the cursor', () => {
    const blink = cursorVariants.blink

    expect(blink).toMatchObject({
      opacity: [1, 1, 0, 0, 1],
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity,
        times: [0, 0.49, 0.5, 0.99, 1],
      },
    })
  })
})
