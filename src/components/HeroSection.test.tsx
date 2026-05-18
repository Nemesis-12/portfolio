import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import HeroSection from './HeroSection'
import {
  CTA_DELAY,
  FIRST_NAME,
  INITIAL_DELAY,
  LAST_NAME,
  NAME_SPEED,
  SUBTITLE,
  SUBTITLE_SPEED,
  VALUE_PROP,
  VALUE_PROP_DELAY,
  VALUE_PROP_SPEED,
  cursorVariants,
} from './HeroSection.constants'

const TYPEWRITER_DURATION =
  INITIAL_DELAY +
  SUBTITLE.length * SUBTITLE_SPEED +
  VALUE_PROP_DELAY +
  VALUE_PROP.length * VALUE_PROP_SPEED

describe('HeroSection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('uses a 3.2 second initial handoff delay', () => {
    expect(INITIAL_DELAY).toBe(3200)
  })

  it('shows the developer name', () => {
    render(<HeroSection />)
    expect(screen.getByTestId('hero-name')).toBeInTheDocument()
  })

  it('keeps the init label clear of the navbar and aligns its underline to the leading slashes', () => {
    render(<HeroSection />)

    const content = screen.getByTestId('hero-content')
    const labelUnit = screen.getByTestId('hero-init-label-unit')
    const label = screen.getByText('// PORTFOLIO_INIT')
    const underline = screen.getByTestId('hero-init-label-underline')

    expect(content).toHaveClass('pt-16')
    expect(labelUnit).toHaveClass('w-fit')
    expect(labelUnit).toContainElement(label)
    expect(labelUnit).toContainElement(underline)
    expect(label.textContent?.startsWith('//')).toBe(true)
    expect(label.nextElementSibling).toBe(underline)
    expect(underline).toHaveClass('ml-0')
  })

  it('marks the dot grid as a slow parallax layer', () => {
    render(<HeroSection />)
    const dotGrid = screen.getByTestId('hero-dot-grid')

    expect(dotGrid).toHaveAttribute('data-parallax')
    expect(dotGrid).toHaveAttribute('data-parallax-factor', '0.3')
  })

  it('subtitle and value prop are empty initially', () => {
    render(<HeroSection />)

    const subtitle = screen.getByTestId('subtitle')
    const valueProp = screen.getByTestId('value-prop')

    expect(subtitle.textContent).toBe('')
    expect(valueProp.textContent).toBe('')
  })

  it('subtitle starts typing after 3200ms delay', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(INITIAL_DELAY)
    })

    const subtitle = screen.getByTestId('subtitle')
    expect(subtitle.textContent).toBe('')
    expect(screen.getByTestId('subtitle-cursor')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(SUBTITLE_SPEED)
    })

    expect(subtitle.textContent).toBe('C')
    expect(subtitle.lastElementChild).toBe(screen.getByTestId('subtitle-cursor'))
  })

  it('subtitle completes at 60ms/char and removes its cursor immediately', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(INITIAL_DELAY)
      vi.advanceTimersByTime(SUBTITLE.length * SUBTITLE_SPEED)
    })

    const subtitle = screen.getByTestId('subtitle')
    expect(subtitle.textContent).toBe(SUBTITLE)
    expect(screen.queryByTestId('subtitle-cursor')).not.toBeInTheDocument()
  })

  it('value prop waits until subtitle completes plus the 400ms gap before typing', () => {
    render(<HeroSection />)
    const valueProp = screen.getByTestId('value-prop')

    act(() => {
      vi.advanceTimersByTime(INITIAL_DELAY + SUBTITLE.length * SUBTITLE_SPEED)
    })

    expect(valueProp.textContent).toBe('')
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_DELAY)
    })

    expect(valueProp.textContent).toBe('')
    expect(screen.getByTestId('value-prop-cursor')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_SPEED)
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
    expect(valueProp.textContent).toBe(VALUE_PROP)
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()
  })

  it('cleans up pending typewriter timers when unmounted', () => {
    const { unmount } = render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(INITIAL_DELAY + SUBTITLE.length * SUBTITLE_SPEED)
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

  it('shows a blinking cursor after the name once typing completes', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(INITIAL_DELAY + (FIRST_NAME.length + 1 + LAST_NAME.length) * NAME_SPEED)
    })

    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
    expect(screen.getByTestId('hero-name')).toBeInTheDocument()
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
