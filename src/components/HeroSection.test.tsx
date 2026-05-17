import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import HeroSection from './HeroSection'
import { cursorVariants } from './HeroSection.constants'

const SUBTITLE_TEXT = 'CS_STUDENT · DEVELOPER'
const VALUE_PROP_TEXT = '// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.'
const TYPEWRITER_DURATION = 400 + SUBTITLE_TEXT.length * 60 + 400 + VALUE_PROP_TEXT.length * 35
const CTA_DELAY = 200

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

    act(() => {
      vi.advanceTimersByTime(400)
      vi.advanceTimersByTime(SUBTITLE_TEXT.length * 60)
    })

    const subtitle = screen.getByTestId('subtitle')
    expect(subtitle.textContent).toBe(SUBTITLE_TEXT)
    expect(screen.queryByTestId('subtitle-cursor')).not.toBeInTheDocument()
  })

  it('value prop waits until subtitle completes plus the 400ms gap before typing', () => {
    render(<HeroSection />)
    const valueProp = screen.getByTestId('value-prop')

    act(() => {
      vi.advanceTimersByTime(400 + SUBTITLE_TEXT.length * 60)
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

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_DURATION)
    })

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp.textContent).toBe(VALUE_PROP_TEXT)
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()
  })

  it('cleans up pending typewriter timers when unmounted', () => {
    const { unmount } = render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(400 + SUBTITLE_TEXT.length * 60)
    })

    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('shows the VIEW_WORK call-to-action linking to projects section', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_DURATION + CTA_DELAY)
    })

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

  it('CTAs are absent before typewriter sequence completes', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_DURATION)
    })

    expect(screen.queryByRole('link', { name: /VIEW_WORK →/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /VIEW_RESUME →/i })).not.toBeInTheDocument()
  })

  it('CTAs remain absent until the full 200ms post-typewriter delay elapses', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_DURATION + CTA_DELAY - 1)
    })

    expect(screen.queryByRole('link', { name: /VIEW_WORK →/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /VIEW_RESUME →/i })).not.toBeInTheDocument()
  })

  it('cleans up the pending CTA reveal timer when unmounted', () => {
    const { unmount } = render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_DURATION)
    })

    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('CTAs appear after value prop completes plus 200ms delay', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_DURATION + CTA_DELAY)
    })

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const viewResume = screen.getByRole('link', { name: /VIEW_RESUME →/i })

    expect(viewWork).toBeInTheDocument()
    expect(viewWork).toHaveAttribute('href', '#projects')
    expect(viewResume).toBeInTheDocument()
    expect(viewResume).toHaveAttribute('href', '/resume.pdf')
    expect(viewResume).toHaveAttribute('target', '_blank')
    expect(viewResume).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('VIEW_WORK uses filled tangerine style, VIEW_RESUME uses outlined style', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(TYPEWRITER_DURATION + CTA_DELAY)
    })

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const viewResume = screen.getByRole('link', { name: /VIEW_RESUME →/i })

    expect(viewWork).toHaveClass('bg-atomic-tangerine')
    expect(viewWork).toHaveClass('text-graphite')
    expect(viewResume).toHaveClass('border-atomic-tangerine')
    expect(viewResume).toHaveClass('text-atomic-tangerine')
  })
})
