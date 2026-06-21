import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import HeroSection from './HeroSection'
import { FIRST_NAME, LAST_NAME, NAME_SPEED, ROLES, VALUE_PROP } from './HeroSection.constants'

const INIT_TEXT = '// PORTFOLIO_INIT'
const INIT_SPEED = 28
const INIT_DURATION = INIT_TEXT.length * INIT_SPEED

const FIRST_NAME_DELAY = 200
const LAST_NAME_DELAY = 150
const FIRST_NAME_DURATION = FIRST_NAME_DELAY + FIRST_NAME.length * NAME_SPEED
const LAST_NAME_DURATION = LAST_NAME_DELAY + LAST_NAME.length * NAME_SPEED

const ROLE_TYPE_SPEED = 55
const ROLE_ERASE_SPEED = 28
const ROLE_HOLD_MS = 2200
const ROLE_START_DELAY = 400

function advanceToInitDone() {
  act(() => {
    vi.advanceTimersByTime(INIT_DURATION)
  })
}

function advanceToNameComplete() {
  advanceToInitDone()
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

    const label = document.querySelector('.hero-init')
    const bar = document.querySelector('.hero-bar')

    expect(label).toBeInTheDocument()
    expect(label).toHaveClass('hero-init')
    expect(bar).toBeInTheDocument()
    expect(label?.nextElementSibling).toBe(bar)
  })

  it('types the PORTFOLIO_INIT label via TypeIn at 28ms/char', () => {
    render(<HeroSection />)

    const label = document.querySelector('.hero-init') as HTMLElement
    expect(label.textContent).toBe('')

    act(() => {
      vi.advanceTimersByTime(INIT_SPEED)
    })
    expect(label.textContent).toBe(INIT_TEXT.slice(0, 1))

    advanceToInitDone()
    expect(label.textContent).toBe(INIT_TEXT)
  })

  it('wraps hero content in hero-inner for horizontal padding', () => {
    render(<HeroSection />)

    const content = screen.getByTestId('hero-content')
    expect(content).toHaveClass('hero-inner')
    expect(content).toHaveClass('pt-24')
  })

  it('marks the line grid as a slow parallax layer', () => {
    render(<HeroSection />)
    const lineGrid = screen.getByTestId('hero-grid')

    expect(lineGrid).toHaveClass('hero-grid')
    expect(lineGrid).toHaveAttribute('data-parallax')
    expect(lineGrid).toHaveAttribute('data-parallax-factor', '0.3')
  })

  it('marks the hero name as a subtle parallax layer', () => {
    render(<HeroSection />)
    const heroName = screen.getByTestId('hero-name')

    expect(heroName).toHaveAttribute('data-parallax')
    expect(heroName).toHaveAttribute('data-parallax-factor', '0.15')
  })

  it('does not start name typing until the init label finishes typing', () => {
    render(<HeroSection />)

    const nameLines = screen.getByTestId('hero-name').querySelectorAll('.hero-name-line')

    act(() => {
      vi.advanceTimersByTime(INIT_DURATION - INIT_SPEED)
    })

    expect(nameLines[0]?.textContent).toBe('')
    expect(nameLines[1]?.textContent).toBe('')
  })

  it('types FARHAN completely before MOHAMMED begins', () => {
    render(<HeroSection />)

    advanceToInitDone()

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

  it('does not start name typing until introReady is true', () => {
    render(<HeroSection introReady={false} />)

    const nameLines = screen.getByTestId('hero-name').querySelectorAll('.hero-name-line')

    act(() => {
      vi.advanceTimersByTime(INIT_DURATION + FIRST_NAME_DURATION + LAST_NAME_DURATION)
    })

    expect(nameLines[0]?.textContent).toBe('')
    expect(nameLines[1]?.textContent).toBe('')
    expect(screen.queryByTestId('hero-name-cursor')).not.toBeInTheDocument()
  })

  it('starts the init label and name typing from the beginning when introReady becomes true', () => {
    const { rerender } = render(<HeroSection introReady={false} />)
    const nameLines = screen.getByTestId('hero-name').querySelectorAll('.hero-name-line')

    act(() => {
      vi.advanceTimersByTime(INIT_DURATION)
    })

    expect(nameLines[0]?.textContent).toBe('')

    rerender(<HeroSection introReady={true} />)

    advanceToInitDone()
    act(() => {
      vi.advanceTimersByTime(FIRST_NAME_DELAY + NAME_SPEED)
    })

    expect(nameLines[0]?.textContent).toBe(FIRST_NAME.slice(0, 1))
    expect(nameLines[1]?.textContent).toBe('')
  })

  it('cleans up pending timers when unmounted', () => {
    const { unmount } = render(<HeroSection />)

    advanceToNameComplete()

    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('shows a blinking cursor after the name once typing completes', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const cursor = screen.getByTestId('hero-name-cursor')
    const nameLines = screen.getByTestId('hero-name').querySelectorAll('.hero-name-line')

    expect(cursor).toBeInTheDocument()
    expect(nameLines[1]?.contains(cursor)).toBe(true)
  })

  it('drives the name cursor blink with the CSS .cursor class, not framer-motion', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const cursor = screen.getByTestId('hero-name-cursor')
    expect(cursor).toHaveClass('cursor')
    expect(cursor.tagName).toBe('SPAN')
  })

  it('is absent for rotating role, value prop, and CTAs before the name finishes', () => {
    render(<HeroSection />)

    act(() => {
      vi.advanceTimersByTime(INIT_DURATION + FIRST_NAME_DURATION)
    })

    expect(screen.queryByTestId('rotating-role')).not.toBeInTheDocument()
    expect(screen.queryByTestId('value-prop')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /VIEW_WORK →/i })).not.toBeInTheDocument()
  })

  it('reveals rotating role, value prop, and CTAs together once the name finishes', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    expect(screen.getByTestId('rotating-role')).toBeInTheDocument()
    expect(screen.getByTestId('value-prop')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /VIEW_WORK →/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /VIEW_RESUME →/i })).toBeInTheDocument()
  })

  it('value prop renders fully and statically once the name finishes (no typing)', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp.textContent).toBe(VALUE_PROP)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(valueProp.textContent).toBe(VALUE_PROP)
  })

  it('applies hero-tag and hero-fade with the correct animationDelay to the value prop', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const valueProp = screen.getByTestId('value-prop')
    expect(valueProp).toHaveClass('hero-tag')
    expect(valueProp).toHaveClass('hero-fade')
    expect(valueProp.style.animationDelay).toBe('380ms')
  })

  it('applies hero-fade with the correct animationDelay to the rotating role wrapper', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const rotatingRole = screen.getByTestId('rotating-role')
    const wrapper = rotatingRole.parentElement

    expect(wrapper).toHaveClass('hero-fade')
    expect((wrapper as HTMLElement).style.animationDelay).toBe('120ms')
    expect(rotatingRole).toHaveClass('hero-role')
  })

  it('applies hero-cta and hero-fade with the correct animationDelay to the CTA row', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const ctaRow = viewWork.parentElement

    expect(ctaRow).toHaveClass('hero-cta')
    expect(ctaRow).toHaveClass('hero-fade')
    expect((ctaRow as HTMLElement).style.animationDelay).toBe('620ms')
  })

  it('does not render a value-prop-cursor testid (value prop is no longer typed)', () => {
    render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.queryByTestId('value-prop-cursor')).not.toBeInTheDocument()
  })

  it('rotating role stays stopped until both name lines finish typing', () => {
    render(<HeroSection />)

    advanceToInitDone()
    act(() => {
      vi.advanceTimersByTime(FIRST_NAME_DURATION)
    })

    expect(screen.queryByTestId('rotating-role')).not.toBeInTheDocument()
  })

  it('rotating role waits startDelay=400ms after name completes before typing the first role', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const rotatingRole = screen.getByTestId('rotating-role')
    expect(rotatingRole.textContent).toBe('')

    act(() => {
      vi.advanceTimersByTime(ROLE_START_DELAY - 1)
    })
    expect(rotatingRole.textContent).toBe('')

    act(() => {
      vi.advanceTimersByTime(1 + ROLE_TYPE_SPEED)
    })
    expect(rotatingRole.textContent).toContain(ROLES[0].slice(0, 1))
  })

  it('rotating role appears after name completes with first role CS_STUDENT', () => {
    render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(ROLE_START_DELAY)
    })
    advanceRoleTyping(ROLES[0])

    const rotatingRole = screen.getByTestId('rotating-role')
    expect(rotatingRole).toBeInTheDocument()
    expect(rotatingRole.textContent).toContain('CS_STUDENT')
  })

  it('rotating role cycles through all five roles in order', () => {
    render(<HeroSection />)

    advanceToNameComplete()
    act(() => {
      vi.advanceTimersByTime(ROLE_START_DELAY)
    })

    ROLES.forEach((role) => {
      advanceRoleTyping(role)
      expect(screen.getByTestId('rotating-role').textContent).toContain(role)

      act(() => {
        vi.advanceTimersByTime(ROLE_HOLD_MS + (role.length + 1) * ROLE_ERASE_SPEED)
      })
    })
  })

  it('shows the VIEW_WORK call-to-action linking to projects section', () => {
    render(<HeroSection />)

    advanceToNameComplete()

    const link = screen.getByRole('link', { name: /VIEW_WORK →/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#projects')
  })

  it('CTAs preserve project and resume link targets', () => {
    render(<HeroSection />)

    advanceToNameComplete()

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

    advanceToNameComplete()

    const viewWork = screen.getByRole('link', { name: /VIEW_WORK →/i })
    const viewResume = screen.getByRole('link', { name: /VIEW_RESUME →/i })

    expect(viewWork).toHaveClass('btn')
    expect(viewWork).toHaveClass('btn-fill')
    expect(viewResume).toHaveClass('btn')
    expect(viewResume).toHaveClass('btn-outline')
  })

  it('VIEW_WORK click smooth-scrolls to the projects section', () => {
    const projects = document.createElement('section')
    projects.id = 'projects'
    Object.defineProperty(projects, 'offsetTop', { configurable: true, value: 1200 })
    document.body.appendChild(projects)
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    try {
      render(<HeroSection />)
      advanceToNameComplete()

      screen.getByRole('link', { name: /VIEW_WORK →/i }).click()

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 1200, behavior: 'smooth' })
    } finally {
      projects.remove()
      scrollToSpy.mockRestore()
    }
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
})
