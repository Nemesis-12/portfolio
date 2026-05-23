import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import HeroSection from './HeroSection'
import {
  FIRST_NAME,
  LAST_NAME,
  NAME_SPEED,
  ROLES,
  VALUE_PROP,
  VALUE_PROP_SPEED,
  cursorVariants,
} from './HeroSection.constants'

const FIRST_NAME_DURATION = FIRST_NAME.length * NAME_SPEED
const LAST_NAME_DURATION = LAST_NAME.length * NAME_SPEED
const ROLE_TYPE_SPEED = 40
const ROLE_ERASE_SPEED = 30
const ROLE_HOLD_MS = 2000

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

function advanceFirstRoleCycle() {
  advanceRoleTyping(ROLES[0])
  act(() => {
    vi.advanceTimersByTime(ROLE_HOLD_MS + (ROLES[0].length + 1) * ROLE_ERASE_SPEED)
  })
  advanceRoleTyping(ROLES[1])
}

function advanceToValuePropStart() {
  advanceToNameComplete()
  advanceFirstRoleCycle()
}

function advanceToValuePropComplete() {
  advanceToValuePropStart()
  act(() => {
    vi.advanceTimersByTime(VALUE_PROP.length * VALUE_PROP_SPEED)
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

  it('renders two stacked hero-name-line spans inside hero-name', () => {
    render(<HeroSection />)

    const heading = screen.getByTestId('hero-name')
    const nameLines = heading.querySelectorAll('.hero-name-line')

    expect(heading).toHaveClass('hero-name')
    expect(nameLines).toHaveLength(2)
    expect(nameLines[0]).toBeInTheDocument()
    expect(nameLines[1]).toBeInTheDocument()
  })

  it('shows hero-init label and hero-bar aligned beneath it', () => {
    render(<HeroSection />)

    const label = screen.getByText('// PORTFOLIO_INIT')
    const bar = document.querySelector('.hero-bar')

    expect(label).toHaveClass('hero-init')
    expect(bar).toBeInTheDocument()
    expect(label.nextElementSibling).toBe(bar)
  })

  it('wraps hero content in hero-inner for horizontal padding', () => {
    render(<HeroSection />)

    const content = screen.getByTestId('hero-content')
    expect(content).toHaveClass('hero-inner')
    expect(content).toHaveClass('pt-16')
  })

  it('marks the line grid as a slow parallax layer', () => {
    render(<HeroSection />)
    const lineGrid = screen.getByTestId('hero-grid')

    expect(lineGrid).toHaveClass('hero-grid')
    expect(lineGrid).toHaveAttribute('data-parallax')
    expect(lineGrid).toHaveAttribute('data-parallax-factor', '0.3')
  })

  it('value prop is empty initially', () => {
    render(<HeroSection />)

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp.textContent).toBe('')
  })

  it('value prop waits until RotatingRole completes the first role cycle before typing', () => {
    render(<HeroSection />)
    const valueProp = screen.getByTestId('value-prop')

    advanceToNameComplete()

    expect(valueProp.textContent).toBe('')
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()

    advanceRoleTyping(ROLES[0])
    expect(valueProp.textContent).toBe('')
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(ROLE_HOLD_MS + (ROLES[0].length + 1) * ROLE_ERASE_SPEED)
    })

    expect(valueProp.textContent).toBe('')
    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()

    advanceRoleTyping(ROLES[1])

    expect(screen.getByTestId('value-prop-cursor')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(VALUE_PROP_SPEED)
    })

    expect(valueProp.textContent.length).toBeGreaterThan(0)
    expect(valueProp.textContent.length).toBeLessThan(VALUE_PROP.length)
    expect(valueProp.lastElementChild).toBe(screen.getByTestId('value-prop-cursor'))
  })

  it('value prop completes at 35ms/char and removes its cursor immediately', () => {
    render(<HeroSection />)

    advanceToValuePropComplete()

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

    advanceToValuePropComplete()

    const link = screen.getByRole('link', { name: /VIEW_WORK →/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#projects')
  })

  it('shows a blinking cursor after the name once typing completes', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const cursor = screen.getByTestId('hero-name-cursor')
    const nameLines = screen.getByTestId('hero-name').querySelectorAll('.hero-name-line')

    expect(cursor).toBeInTheDocument()
    expect(nameLines[1]?.contains(cursor)).toBe(true)
  })

  it('types FARHAN completely before MOHAMMED begins', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(FIRST_NAME_DURATION - NAME_SPEED)
    })

    const nameLines = screen.getByTestId('hero-name').querySelectorAll('.hero-name-line')
    expect(nameLines[0]?.textContent).toBe(FIRST_NAME.slice(0, -1))
    expect(nameLines[1]?.textContent).toBe('')

    act(() => {
      vi.advanceTimersByTime(NAME_SPEED)
    })

    expect(nameLines[0]?.textContent).toBe(FIRST_NAME)
    expect(nameLines[1]?.textContent).toBe('')
  })

  it('applies hero-role to the rotating role line', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    expect(screen.getByTestId('rotating-role')).toHaveClass('hero-role')
  })

  it('applies hero-tag to the value prop line', () => {
    render(<HeroSection />)

    expect(screen.getByTestId('value-prop')).toHaveClass('hero-tag')
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

    advanceToValuePropStart()
    act(() => {
      vi.advanceTimersByTime(VALUE_PROP.length * VALUE_PROP_SPEED - 1)
    })

    expect(screen.queryByRole('link', { name: /VIEW_WORK →/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /VIEW_RESUME →/i })).not.toBeInTheDocument()
  })

  it('CTAs appear as soon as the value prop TypeIn finishes', () => {
    render(<HeroSection />)

    advanceToValuePropComplete()

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const viewResume = screen.getByRole('link', { name: /VIEW_RESUME →/i })

    expect(viewWork).toBeInTheDocument()
    expect(viewResume).toBeInTheDocument()
  })

  it('cleans up pending intro timers when unmounted', () => {
    const { unmount } = render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(ROLE_TYPE_SPEED)
    })

    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('CTAs preserve project and resume link targets after value prop completes', () => {
    render(<HeroSection />)

    advanceToValuePropComplete()

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const viewResume = screen.getByRole('link', { name: /VIEW_RESUME →/i })

    expect(viewWork).toBeInTheDocument()
    expect(viewWork).toHaveAttribute('href', '#projects')
    expect(viewResume).toBeInTheDocument()
    expect(viewResume).toHaveAttribute('href', '/resume.pdf')
    expect(viewResume).toHaveAttribute('target', '_blank')
    expect(viewResume).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('VIEW_WORK uses btn btn-fill, VIEW_RESUME uses btn btn-outline', () => {
    render(<HeroSection />)

    advanceToValuePropComplete()

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const viewResume = screen.getByRole('link', { name: /VIEW_RESUME →/i })

    expect(viewWork).toHaveClass('btn')
    expect(viewWork).toHaveClass('btn-fill')
    expect(viewResume).toHaveClass('btn')
    expect(viewResume).toHaveClass('btn-outline')
  })

  it('wraps CTAs in hero-cta after value prop completes', () => {
    render(<HeroSection />)

    advanceToValuePropComplete()

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const ctaRow = viewWork.parentElement

    expect(ctaRow).toHaveClass('hero-cta')
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
        vi.advanceTimersByTime(ROLE_HOLD_MS + (role.length + 1) * ROLE_ERASE_SPEED)
      })
    })
  })

  it('does not start name typing until introReady is true', () => {
    render(<HeroSection introReady={false} />)

    const nameLines = screen.getByTestId('hero-name').querySelectorAll('.hero-name-line')

    act(() => {
      vi.advanceTimersByTime(FIRST_NAME_DURATION + LAST_NAME_DURATION)
    })

    expect(nameLines[0]?.textContent).toBe('')
    expect(nameLines[1]?.textContent).toBe('')
    expect(screen.queryByTestId('hero-name-cursor')).not.toBeInTheDocument()
  })

  it('starts name typing from the beginning when introReady becomes true', () => {
    const { rerender } = render(<HeroSection introReady={false} />)
    const nameLines = screen.getByTestId('hero-name').querySelectorAll('.hero-name-line')

    act(() => {
      vi.advanceTimersByTime(FIRST_NAME_DURATION)
    })

    expect(nameLines[0]?.textContent).toBe('')

    rerender(<HeroSection introReady={true} />)

    act(() => {
      vi.advanceTimersByTime(NAME_SPEED)
    })

    expect(nameLines[0]?.textContent).toBe(FIRST_NAME.slice(0, 1))
    expect(nameLines[1]?.textContent).toBe('')
  })
})
