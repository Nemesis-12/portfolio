import './TimelineSection.test-setup'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import TimelineSection from './TimelineSection'
import { useTimelineScroll } from '../hooks/useTimelineScroll'
import {
  DEFAULT_ACTIVE,
  getTimelinePanel,
  mockTimelineScrollState,
} from './TimelineSection.test-setup'

describe('TimelineSection rendering', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([...DEFAULT_ACTIVE]))
  })

  it('each entry uses tl-panel layout class', () => {
    render(<TimelineSection />)
    const commitEntries = screen.getAllByTestId('commit-entry')
    expect(commitEntries.length).toBe(4)
    commitEntries.forEach((entry) => {
      expect(entry).toHaveClass('tl-panel')
    })
  })

  describe('issue #97 - full-screen stacked panels', () => {
    it('timeline entries are full-viewport panels inside one horizontal track', () => {
      render(<TimelineSection />)

      const timelineSection = document.getElementById('timeline')
      const track = document.querySelector('[data-timeline-track="true"]')
      const panels = document.querySelectorAll('[data-testid="timeline-panel"]')

      expect(timelineSection).toBeInTheDocument()
      expect(track).toBeInTheDocument()
      expect(panels).toHaveLength(4)
      panels.forEach((panel) => {
        expect(panel.querySelector('.tl-panel')).toBeInTheDocument()
      })
    })

    it('each panel has a section label (EXPERIENCE or EDUCATION)', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      expect(sectionLabels.length).toBe(4)

      const labelTexts = Array.from(sectionLabels).map((el) => el.textContent)
      expect(labelTexts.filter((t) => t === '//EXPERIENCE').length).toBe(2)
      expect(labelTexts.filter((t) => t === '//EDUCATION').length).toBe(2)
    })

    it('section labels use tl-section-tag with portfolio typography classes', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      sectionLabels.forEach((label) => {
        expect(label.className).toContain('tl-section-tag')
        expect(label.className).not.toContain('font-display')
        expect(label.className).not.toContain('text-atomic-tangerine')
      })
    })

    it('section label // and word are separate tl-section-slash and tl-section-kind siblings', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      sectionLabels.forEach((label) => {
        const slash = label.querySelector('.tl-section-slash')
        const word = label.querySelector('.tl-section-kind')
        expect(slash?.textContent).toBe('//')
        expect(slash?.className).toContain('tl-section-slash')
        expect(slash?.className).not.toContain('text-xs')
        expect(word?.className).toContain('tl-section-kind')
        expect(word?.className).not.toContain('text-sm')
      })
    })
  })

  describe('issue #161 - v4 desktop panel visual hierarchy', () => {
    it('commit hash uses tl-commit, author and date use tl-meta', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const metadata = getTimelinePanel(0).querySelector('[data-testid="commit-metadata"]')
      expect(metadata?.querySelector('[data-testid="commit-hash"]')).toHaveClass('tl-commit')
      expect(metadata?.querySelector('[data-testid="commit-author"]')).toHaveClass('tl-meta')
      expect(metadata?.querySelector('[data-testid="commit-date"]')).toHaveClass('tl-meta')
    })

    it('institution heading uses tl-org portfolio class', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const institution = getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')
      expect(institution).toHaveClass('tl-org')
      expect(institution?.textContent).toBe('NETAPP INC.')
    })

    it('role uses tl-title portfolio class', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const role = getTimelinePanel(0).querySelector('[data-testid="commit-role"]')
      expect(role).toHaveClass('tl-title')
      expect(role?.textContent).toBe('SOFTWARE_ENGINEER_INTERN')
    })

    it('bullets use tl-bullets portfolio class', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const details = getTimelinePanel(0).querySelector('[data-testid="commit-details"]')
      expect(details).toHaveClass('tl-bullets')
    })

    it('section tag carries experience or education category class', () => {
      render(<TimelineSection />)

      expect(getTimelinePanel(0).querySelector('[data-testid="section-label"]')?.className).toContain(
        'experience',
      )
      expect(getTimelinePanel(1).querySelector('[data-testid="section-label"]')?.className).toContain(
        'experience',
      )
      expect(getTimelinePanel(2).querySelector('[data-testid="section-label"]')?.className).toContain(
        'education',
      )
      expect(getTimelinePanel(3).querySelector('[data-testid="section-label"]')?.className).toContain(
        'education',
      )
    })

    it('inserts tl-sep spacer before institution heading', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const institution = getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')
      expect(institution?.previousElementSibling).toHaveClass('tl-sep')
    })
  })

  describe('issue #288 - persistent blinking carets after typing completes', () => {
    it('shows no caret on institution or role before either field has started typing', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')).toBeNull()
      expect(getTimelinePanel(0).querySelector('[data-testid="commit-role"]')).toBeNull()
    })

    it('renders a persistent caret on the institution heading once typed', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const institution = getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')
      const caret = institution?.querySelector('.caret')
      expect(caret).toBeInTheDocument()
    })

    it('renders a persistent caret on the role line once typed', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const role = getTimelinePanel(0).querySelector('[data-testid="commit-role"]')
      const caret = role?.querySelector('.caret')
      expect(caret).toBeInTheDocument()
    })
  })

  describe('issue #206 - timeline section chrome', () => {
    it('renders // 03 TIMELINE header with hscroll classes', () => {
      render(<TimelineSection />)

      expect(document.querySelector('.hscroll-head')).toBeInTheDocument()
      expect(document.querySelector('.hscroll-no')?.textContent).toBe('// 03')
      expect(document.querySelector('.hscroll-name')?.textContent).toBe('TIMELINE')
      expect(document.querySelector('.hscroll-rule')).toBeInTheDocument()
    })

    it('renders progress counter with resume entry count 01 / 04', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false, false]))

      render(<TimelineSection />)

      expect(screen.getByTestId('progress-count')).toHaveTextContent('01 / 04')
    })

    it('progress counter advances with active panel index', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, true, false, false], { activeIndex: 1, progress: 0.5 }),
      )

      render(<TimelineSection />)

      expect(screen.getByTestId('progress-count')).toHaveTextContent('02 / 04')
    })

    it('progress fill width reflects scroll progress', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, true, false, false], { activeIndex: 1, progress: 0.5 }),
      )

      render(<TimelineSection />)

      expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '50%' })
    })

    it('uses hscroll-progress classes for counter and bar', () => {
      render(<TimelineSection />)

      expect(document.querySelector('.hscroll-progress')).toBeInTheDocument()
      expect(document.querySelector('.hscroll-progress-track')).toBeInTheDocument()
      expect(document.querySelector('.hscroll-progress-fill')).toBeInTheDocument()
    })

    it('section chrome renders once not per panel', () => {
      render(<TimelineSection />)

      expect(document.querySelectorAll('.hscroll-head')).toHaveLength(1)
    })

    it('renders SCROLL ↓ hint when on first panel', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))

      render(<TimelineSection />)

      const hint = screen.getByTestId('scroll-hint')
      expect(hint).toHaveTextContent(/SCROLL/)
      expect(hint).toHaveTextContent(/↓/)
      expect(hint).toHaveAttribute('data-visible', 'true')
      expect(hint).toHaveClass('hscroll-hint')
    })

    it('hides scroll hint after first panel beat', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, true, false, false], { activeIndex: 1, progress: 0.5 }),
      )

      render(<TimelineSection />)

      expect(screen.getByTestId('scroll-hint')).toHaveAttribute('data-visible', 'false')
    })

    it('scroll hint is visually secondary (aria-hidden)', () => {
      render(<TimelineSection />)

      expect(screen.getByTestId('scroll-hint')).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
