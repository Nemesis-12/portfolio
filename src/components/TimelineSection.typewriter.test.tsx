import './TimelineSection.test-setup'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import TimelineSection from './TimelineSection'
import { useTimelineScroll } from '../hooks/useTimelineScroll'
import {
  DEFAULT_ACTIVE,
  getTimelinePanel,
  mockTimelineScrollState,
} from './TimelineSection.test-setup'

describe('TimelineSection typewriter', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([...DEFAULT_ACTIVE]))
  })

  it('entries stay empty when scroll state marks every panel inactive', () => {
    vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, false, false]))

    render(<TimelineSection />)

    const typewriterLines = document.querySelectorAll('[data-typewriter-line]')
    expect(typewriterLines.length).toBe(0)
  })

  describe('issue #97 - full-screen stacked panels', () => {
    it('Typewriter types commit metadata when panel becomes active', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const firstPanelLines = Array.from(allLines).filter((_, i) => i < 5)
      expect(firstPanelLines.length).toBeGreaterThan(0)
      expect(firstPanelLines[0].textContent).toBe('commit e5f1a3d')
    })

    it('Typewriter types all fields to completion when panel stays active', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const texts = Array.from(allLines).map((el) => el.textContent)

      expect(texts).toContain('commit e5f1a3d')
      expect(texts).toContain('Author: Farhan Mohammed')
      expect(texts).toContain('Date:   JUN 2026 – PRESENT')
      expect(texts).toContain('NETAPP INC.')
      expect(texts).toContain('SOFTWARE_ENGINEER_INTERN')
    })

    it('Typewriter types bullets when present', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const texts = Array.from(allLines).map((el) => el.textContent)

      expect(texts.some((text) => text?.includes('Contributed to web platform development'))).toBe(true)
    })

    it('inactive panels remain empty', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(100)
      })

      const panel1Lines = getTimelinePanel(1).querySelectorAll('[data-typewriter-line]')
      const panel2Lines = getTimelinePanel(2).querySelectorAll('[data-typewriter-line]')
      expect(panel1Lines.length).toBe(0)
      expect(panel2Lines.length).toBe(0)
    })

    it('Typewriter holds position when panel is scrolled away mid-type', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, false, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const heldText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(heldText).toBe(partialText)
    })

    it('Typewriter restarts from the first line when panel becomes active again', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })
      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, false, false]))
      rerender(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      rerender(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(100)
      })

      const restartedText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(restartedText).toBe(partialText)
      expect(getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')).toBeNull()
    })

    it('issue #98 - longest bullet completes within 2.5s', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(4400)
      })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const texts = Array.from(allLines).map((el) => el.textContent)

      const longestBullet = 'Built automated analysis pipeline processing storage telemetry across distributed RAID systems (FC, SAS, NVMe/RoCE), handling terabytes of performance data.'
      expect(texts).toContain(longestBullet)
    })
  })

  describe('issue #159 - preserve per-panel typewriter progress', () => {
    it('next panel activation does not clear previous panel partial text', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const panel1Partial =
        getTimelinePanel(0).querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(panel1Partial.length).toBeGreaterThan(0)

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, true, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const panel1Held =
        getTimelinePanel(0).querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(panel1Held).toBe(panel1Partial)

      const panel2Lines = getTimelinePanel(1).querySelectorAll('[data-typewriter-line]')
      expect(panel2Lines.length).toBeGreaterThan(0)
    })

    it('deactivation keeps partial text visible before a later restart', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(partialText.length).toBeGreaterThan(0)

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, false, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const inactiveText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(inactiveText).toBe(partialText)

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const restartedText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(restartedText).toBe(partialText)
    })

    it('each panel retains independent partial progress when switching panels', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const panel1Partial =
        getTimelinePanel(0).querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(panel1Partial.length).toBeGreaterThan(0)

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, true, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const panel1Held =
        getTimelinePanel(0).querySelector('[data-typewriter-line]')?.textContent ?? ''
      const panel2Partial =
        getTimelinePanel(1).querySelector('[data-typewriter-line]')?.textContent ?? ''

      expect(panel1Held).toBe(panel1Partial)
      expect(panel2Partial.length).toBeGreaterThan(0)

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const panel1Restarted =
        getTimelinePanel(0).querySelector('[data-typewriter-line]')?.textContent ?? ''
      const panel2Held =
        getTimelinePanel(1).querySelector('[data-typewriter-line]')?.textContent ?? ''

      expect(panel1Restarted).toBe(panel1Partial)
      expect(panel2Held).toBe(panel2Partial)
    })

    it('completed panel text remains when next panel activates', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const panel1Texts = Array.from(
        getTimelinePanel(0).querySelectorAll('[data-typewriter-line]'),
      ).map((el) => el.textContent)

      expect(panel1Texts).toContain('commit e5f1a3d')
      expect(panel1Texts).toContain('NETAPP INC.')

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, true, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const panel1TextsAfter = Array.from(
        getTimelinePanel(0).querySelectorAll('[data-typewriter-line]'),
      ).map((el) => el.textContent)

      expect(panel1TextsAfter).toContain('commit e5f1a3d')
      expect(panel1TextsAfter).toContain('NETAPP INC.')
    })
  })

  describe('issue #160 - structured resume-backed panel content', () => {
    it('renders commit metadata as distinct fields', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const metadata = getTimelinePanel(0).querySelector('[data-testid="commit-metadata"]')
      expect(metadata).toBeInTheDocument()
      expect(metadata?.querySelector('[data-testid="commit-hash"]')?.textContent).toBe(
        'commit e5f1a3d'
      )
      expect(metadata?.querySelector('[data-testid="commit-author"]')?.textContent).toBe(
        'Author: Farhan Mohammed'
      )
      expect(metadata?.querySelector('[data-testid="commit-date"]')?.textContent).toBe(
        'Date:   JUN 2026 – PRESENT'
      )
    })

    it('renders institution as its own heading', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const institution = getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')
      expect(institution?.tagName).toBe('H2')
      expect(institution?.textContent).toBe('NETAPP INC.')
    })

    it('renders role as its own line', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const role = getTimelinePanel(0).querySelector('[data-testid="commit-role"]')
      expect(role?.textContent).toBe('SOFTWARE_ENGINEER_INTERN')
    })

    it('renders bullets as semantic list items', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const details = getTimelinePanel(1).querySelector('[data-testid="commit-details"]')
      expect(details?.tagName).toBe('UL')

      const items = details?.querySelectorAll('li') ?? []
      expect(items.length).toBe(4)
      expect(items[0].textContent).toContain('Built automated analysis pipeline')
    })

    it('preserves data-typewriter-line markers on typed fields', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const typedFields = getTimelinePanel(0).querySelectorAll('[data-typewriter-line]')
      expect(typedFields.length).toBeGreaterThan(0)
      expect(typedFields[0].closest('[data-testid="commit-metadata"]')).toBeTruthy()
    })

    it('omits commit-details list when entry has no bullets', async () => {
      vi.resetModules()
      vi.doMock('../data/timeline', async () => {
        const actual =
          await vi.importActual<typeof import('../data/timeline')>('../data/timeline')
        return {
          ...actual,
          timelineEntries: [
            { ...actual.timelineEntries[0], bullets: [] },
            ...actual.timelineEntries.slice(1),
          ],
        }
      })

      const { default: IsolatedTimelineSection } = await import('./TimelineSection')
      const { useTimelineScroll: isolatedUseTimelineScroll } = await import(
        '../hooks/useTimelineScroll'
      )
      vi.mocked(isolatedUseTimelineScroll).mockReturnValue(
        mockTimelineScrollState([true, false, false, false]),
      )
      vi.useFakeTimers()

      render(<IsolatedTimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const panel = getTimelinePanel(0)
      expect(panel.querySelector('[data-testid="commit-details"]')).not.toBeInTheDocument()
      expect(panel.querySelector('[data-testid="commit-institution"]')?.textContent).toBe(
        'NETAPP INC.',
      )

      vi.doUnmock('../data/timeline')
      vi.resetModules()
    })

    it('holds partial metadata within structured fields when panel deactivates', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialHash =
        getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(partialHash.length).toBeGreaterThan(0)

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, false, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const heldHash =
        getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(heldHash).toBe(partialHash)
      expect(getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')).toBeNull()
    })
  })

  describe('issue #238 - HTML-reference typewriter pacing', () => {
    it('preserves inactive text but restarts from the first line when reactivated', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      expect(getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')).toHaveTextContent(
        'commit e5f1a3d',
      )
      expect(getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')).toHaveTextContent(
        'NETAPP INC.',
      )

      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, true, false, false], { activeIndex: 1, progress: 0.5, tx: -2000 }),
      )
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')).toHaveTextContent(
        'commit e5f1a3d',
      )
      expect(getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')).toHaveTextContent(
        'NETAPP INC.',
      )

      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([true, false, false, false], { activeIndex: 0, progress: 0, tx: -3000 }),
      )
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')).toHaveTextContent(
        'commit e5f1a3d',
      )
      expect(
        getTimelinePanel(0).querySelector('[data-testid="commit-institution"]'),
      ).not.toBeInTheDocument()
    })
  })
})
