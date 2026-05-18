import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import HeroSection from './HeroSection'
import {
  CTA_DELAY,
  FIRST_NAME,
  LAST_NAME,
  NAME_SPEED,
  ROLES,
  VALUE_PROP,
  VALUE_PROP_DELAY,
  VALUE_PROP_SPEED,
  cursorVariants,
} from './HeroSection.constants'

const FIRST_NAME_DURATION = FIRST_NAME.length * NAME_SPEED
const LAST_NAME_DURATION = ` ${LAST_NAME}`.length * NAME_SPEED
const ROLE_TYPE_SPEED = 40

function advanceToNameComplete() {
  act(() => {
    vi.advanceTimersByTime(FIRST_NAME_DURATION)
  })
  act(() => {
    vi.advanceTimersByTime(LAST_NAME_DURATION)
  })
}

function advanceRoleTyping(role: string) {
  act(() => {
    vi.advanceTimersByTime((role.length + 1) * ROLE_TYPE_SPEED)
  })
}

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

  it('value prop is empty initially', () => {
    render(<HeroSection />)

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp.textContent).toBe('')
  })

  it('value prop waits until name completes plus the 400ms gap before typing', () => {
    render(<HeroSection />)
    const valueProp = screen.getByTestId('value-prop')

    advanceToNameComplete()

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

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_DELAY + VALUE_PROP.length * VALUE_PROP_SPEED)
    })

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp.textContent).toBe(VALUE_PROP)
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()
  })

  it('cleans up pending timers when unmounted', () => {
    const { unmount } = render(<HeroSection />)

    advanceToNameComplete()

    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('shows the VIEW_WORK call-to-action linking to projects section', () => {
    render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_DELAY + VALUE_PROP.length * VALUE_PROP_SPEED + CTA_DELAY)
    })

    const link = screen.getByRole('link', { name: /VIEW_WORK →/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#projects')
  })

  it('shows a blinking cursor after the name once typing completes', () => {
    render(<HeroSection />)

    advanceToNameComplete()

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

  it('CTAs are absent before sequence completes', () => {
    render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_DELAY + VALUE_PROP.length * VALUE_PROP_SPEED)
    })

    expect(screen.queryByRole('link', { name: /VIEW_WORK →/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /VIEW_RESUME →/i })).not.toBeInTheDocument()
  })

  it('CTAs remain absent until the full 200ms post-sequence delay elapses', () => {
    render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_DELAY + VALUE_PROP.length * VALUE_PROP_SPEED + CTA_DELAY - 1)
    })

    expect(screen.queryByRole('link', { name: /VIEW_WORK →/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /VIEW_RESUME →/i })).not.toBeInTheDocument()
  })

  it('cleans up the pending CTA reveal timer when unmounted', () => {
    const { unmount } = render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_DELAY + VALUE_PROP.length * VALUE_PROP_SPEED)
    })

    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('CTAs appear after value prop completes plus 200ms delay', () => {
    render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_DELAY + VALUE_PROP.length * VALUE_PROP_SPEED + CTA_DELAY)
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

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_DELAY + VALUE_PROP.length * VALUE_PROP_SPEED + CTA_DELAY)
    })

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const viewResume = screen.getByRole('link', { name: /VIEW_RESUME →/i })

    expect(viewWork).toHaveClass('bg-atomic-tangerine')
    expect(viewWork).toHaveClass('text-graphite')
    expect(viewResume).toHaveClass('border-atomic-tangerine')
    expect(viewResume).toHaveClass('text-atomic-tangerine')
  })

  it('rotating role stays stopped until both name lines finish typing', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(FIRST_NAME_DURATION)
    })

    expect(screen.getByTestId('rotating-role').textContent).toBe('▍')
  })

  it('rotating role appears after name completes with first role CS_STUDENT', () => {
    render(<HeroSection />)

    advanceToNameComplete()
    advanceRoleTyping(ROLES[0])

    const rotatingRole = screen.getByTestId('rotating-role')
    expect(rotatingRole).toBeInTheDocument()
    expect(rotatingRole.textContent).toContain('CS_STUDENT')
  })

  it('rotating role cycles through all five roles in order', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    ROLES.forEach((role) => {
      advanceRoleTyping(role)
      expect(screen.getByTestId('rotating-role').textContent).toContain(role)

      act(() => {
        vi.advanceTimersByTime(2000 + (role.length + 1) * 30)
      })
    })
  })
})
