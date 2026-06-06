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

describe('TimelineSection ordering', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([...DEFAULT_ACTIVE]))
  })

  describe('issue #78 - newest-first ordering', () => {
    it('newest entry is the first user-facing panel at section start', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const newestPanel = document.querySelector('[data-content-index="0"]')
      expect(newestPanel?.querySelector('[data-testid="commit-hash"]')?.textContent).toBe(
        'commit d4e8f2c',
      )
      expect(newestPanel?.querySelector('[data-testid="commit-institution"]')?.textContent).toBe(
        'NETAPP INC.',
      )
    })
  })

  describe('issue #221 - active panel index mapping', () => {
    it('activates the newest entry by default from useTimelineScroll', () => {
      render(<TimelineSection />)

      expect(useTimelineScroll).toHaveBeenCalledWith(expect.objectContaining({ current: null }), 3)
      expect(getTimelinePanel(0).getAttribute('data-content-index')).toBe('0')
      expect(getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')).toBeNull()
    })
  })
})
