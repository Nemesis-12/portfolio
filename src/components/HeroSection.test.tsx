import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import HeroSection, { cursorVariants } from './HeroSection'

describe('HeroSection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
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
      vi.advanceTimersByTime(60)
    })

    const subtitle = screen.getByTestId('subtitle')
    expect(subtitle.textContent).toBe('C')
  })

  it('subtitle completes after typing full string at 60ms/char', () => {
    render(<HeroSection />)
    const subtitleText = 'CS_STUDENT · DEVELOPER'

    act(() => {
      vi.advanceTimersByTime(400)
      vi.advanceTimersByTime(subtitleText.length * 60)
    })

    const subtitle = screen.getByTestId('subtitle')
    expect(subtitle.textContent).toBe(subtitleText)
  })

  it('value prop starts typing after subtitle completes + 400ms gap', () => {
    render(<HeroSection />)

    act(() => {
      vi.runAllTimers()
    })

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp.textContent).not.toBe('')
  })

  it('value prop completes after typing full string at 35ms/char', () => {
    render(<HeroSection />)
    const valuePropText = '// I BUILD THINGS THAT ARE FUN TO FIGURE OUT.'

    act(() => {
      vi.runAllTimers()
    })

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp.textContent).toBe(valuePropText)
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
