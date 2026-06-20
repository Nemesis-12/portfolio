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

describe('TimelineSection scroll', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([...DEFAULT_ACTIVE]))
  })

  describe('issue #214 - timeline scroll shell regression', () => {
    it('timeline is one major section without per-entry global sticky surfaces', () => {
      render(<TimelineSection />)

      expect(document.getElementById('timeline')).toBeInTheDocument()
      expect(document.getElementById('timeline-a3f9d2b')).not.toBeInTheDocument()
      expect(document.getElementById('timeline-b7c3e1a')).not.toBeInTheDocument()
      expect(document.querySelectorAll('[data-sticky-section="true"]')).toHaveLength(0)
    })

    it('timeline outer section keeps an internal sticky viewport only', () => {
      render(<TimelineSection />)

      const timeline = document.getElementById('timeline')
      const stickyViewport = timeline?.querySelector('[data-sticky-viewport="true"]')

      expect(timeline).toHaveAttribute('data-sticky-scroll-host', 'true')
      expect(timeline).not.toHaveAttribute('data-sticky-section')
      expect(stickyViewport).toHaveClass('hscroll-sticky')
    })

    it('clips timeline host overflow without creating an overflow container around sticky content', () => {
      render(<TimelineSection />)

      const timeline = document.getElementById('timeline')

      expect(timeline).toHaveStyle({ overflowX: 'clip' })
      expect(timeline).not.toHaveStyle({ overflowX: 'hidden' })
    })

    it('timeline track translateX is independent from the outer section transform', () => {
      vi.mocked(useTimelineScroll).mockReturnValue({
        active: [false, true, false],
        activeIndex: 1,
        progress: 0.5,
        tx: -1000,
      })

      render(<TimelineSection />)

      const timeline = document.getElementById('timeline') as HTMLElement
      const track = document.querySelector('[data-timeline-track="true"]') as HTMLElement

      expect(timeline.style.transform).toBe('')
      expect(track.style.transform).toContain('translateX(-1000px)')
    })
  })

  describe('issue #220 - one internal horizontal track', () => {
    it('renders one major section with id timeline', () => {
      render(<TimelineSection />)

      const sections = document.querySelectorAll('#timeline')
      expect(sections).toHaveLength(1)
      expect(sections[0]?.tagName.toLowerCase()).toBe('section')
    })

    it('places all entries as panels inside one horizontal track', () => {
      render(<TimelineSection />)

      const track = document.querySelector('[data-timeline-track="true"]')
      const panels = track?.querySelectorAll('[data-testid="timeline-panel"]')

      expect(track).toHaveClass('hscroll-track')
      expect(panels).toHaveLength(4)
    })

    it('renders one snap anchor per timeline entry', () => {
      render(<TimelineSection />)

      const timeline = document.getElementById('timeline')
      const anchors = timeline?.querySelectorAll('.snap-anchor')

      expect(anchors).toHaveLength(4)
      anchors?.forEach((anchor) => {
        expect(anchor.parentElement).toBe(timeline)
      })
      expect(anchors?.[0]).toHaveStyle({ top: '0vh' })
      expect(anchors?.[1]).toHaveStyle({ top: '100vh' })
      expect(anchors?.[2]).toHaveStyle({ top: '200vh' })
      expect(anchors?.[3]).toHaveStyle({ top: '300vh' })
    })

    it('uses one viewport of section height per entry', () => {
      render(<TimelineSection />)

      const timeline = document.getElementById('timeline')
      expect(timeline).toHaveStyle({ height: '400vh' })
    })

    it('does not render each entry as a separate global sticky section', () => {
      render(<TimelineSection />)

      expect(document.querySelectorAll('section[id^="timeline-"]')).toHaveLength(0)
      expect(document.querySelectorAll('[data-sticky-section="true"]')).toHaveLength(0)
    })

    it('renders track panels oldest-to-newest while newest is the first user-facing panel', () => {
      render(<TimelineSection />)

      const panels = Array.from(document.querySelectorAll('[data-testid="timeline-panel"]'))
      const contentIndexes = panels.map((panel) => panel.getAttribute('data-content-index'))

      expect(contentIndexes).toEqual(['3', '2', '1', '0'])
      expect(panels[3]?.getAttribute('data-content-index')).toBe('0')
    })
  })

  describe('issue #235 - restore timeline sticky scroll shell', () => {
    it('outer timeline scroll host uses the shared hscroll shell class', () => {
      render(<TimelineSection />)

      const timeline = document.getElementById('timeline')
      const stickyViewport = timeline?.querySelector('[data-sticky-viewport="true"]')

      expect(timeline).toHaveClass('hscroll')
      expect(stickyViewport).toHaveClass('hscroll-sticky')
    })
  })

  describe('issue #237 - newest-to-oldest slide direction', () => {
    it('renders the track oldest-to-newest while preserving newest-first content semantics', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, true, true, true]))
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const renderedPanels = Array.from(document.querySelectorAll('[data-testid="timeline-panel"]'))
      const renderedContentIndexes = renderedPanels.map((panel) =>
        panel.getAttribute('data-content-index'),
      )
      const renderedHashes = renderedPanels.map(
        (panel) => panel.querySelector('[data-testid="commit-hash"]')?.textContent,
      )

      expect(renderedContentIndexes).toEqual(['3', '2', '1', '0'])
      expect(renderedHashes).toEqual([
        'commit b7c3e1a',
        'commit a3f9d2b',
        'commit d4e8f2c',
        'commit e5f1a3d',
      ])
    })

    it.each([
      {
        active: [true, false, false, false],
        activeIndex: 0,
        expectedHash: 'commit e5f1a3d',
        expectedCount: '01 / 04',
        expectedTx: 'translateX(-3000px)',
      },
      {
        active: [false, true, false, false],
        activeIndex: 1,
        expectedHash: 'commit d4e8f2c',
        expectedCount: '02 / 04',
        expectedTx: 'translateX(-2000px)',
      },
      {
        active: [false, false, true, false],
        activeIndex: 2,
        expectedHash: 'commit a3f9d2b',
        expectedCount: '03 / 04',
        expectedTx: 'translateX(-1000px)',
      },
      {
        active: [false, false, false, true],
        activeIndex: 3,
        expectedHash: 'commit b7c3e1a',
        expectedCount: '04 / 04',
        expectedTx: 'translateX(0px)',
      },
    ])(
      'centers panel $activeIndex with the matching counter and track translation',
      ({ active, activeIndex, expectedHash, expectedCount, expectedTx }) => {
        vi.mocked(useTimelineScroll).mockReturnValue(
          mockTimelineScrollState(active, {
            activeIndex,
            tx: -(3 - activeIndex) * 1000,
          }),
        )
        vi.useFakeTimers()

        render(<TimelineSection />)
        act(() => {
          vi.advanceTimersByTime(15000)
        })

        const activePanel = getTimelinePanel(activeIndex)
        const track = document.querySelector('[data-timeline-track="true"]') as HTMLElement

        expect(activePanel.querySelector('[data-testid="commit-hash"]')).toHaveTextContent(
          expectedHash,
        )
        expect(screen.getByTestId('progress-count')).toHaveTextContent(expectedCount)
        expect(track.style.transform).toContain(expectedTx)
      },
    )
  })

  describe('issue #221 - active panel progression and typewriter persistence', () => {
    it('derives active panels from mocked useTimelineScroll state', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, false, true], { activeIndex: 2, progress: 1, tx: 0 }),
      )
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(getTimelinePanel(2).querySelector('[data-typewriter-line]')).toBeTruthy()
      expect(getTimelinePanel(0).querySelector('[data-typewriter-line]')).toBeNull()
      expect(getTimelinePanel(1).querySelector('[data-typewriter-line]')).toBeNull()
    })

    it('maps scroll progression to older content indexes and track translate', () => {
      const scenarios = [
        {
          active: [true, false, false] as boolean[],
          activeIndex: 0,
          progress: 0,
          tx: -2000,
        },
        {
          active: [false, true, false] as boolean[],
          activeIndex: 1,
          progress: 0.5,
          tx: -1000,
        },
        {
          active: [false, false, true] as boolean[],
          activeIndex: 2,
          progress: 1,
          tx: 0,
        },
      ] as const

      for (const scenario of scenarios) {
        vi.mocked(useTimelineScroll).mockReturnValue(
          mockTimelineScrollState([...scenario.active], {
            activeIndex: scenario.activeIndex,
            progress: scenario.progress,
            tx: scenario.tx,
          }),
        )

        const { unmount } = render(<TimelineSection />)

        expect(screen.getByTestId('progress-count')).toHaveTextContent(
          `${String(scenario.activeIndex + 1).padStart(2, '0')} / 04`,
        )
        expect(document.querySelector('[data-timeline-track="true"]')).toHaveStyle({
          transform: `translateX(${scenario.tx}px)`,
        })

        const activePanel = document.querySelector(
          `[data-content-index="${scenario.activeIndex}"]`,
        )
        expect(activePanel?.querySelector('[data-testid="commit-hash"]')).toBeNull()

        unmount()
      }
    })

    it('keeps typed content visible when the active panel deactivates', () => {
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialHash =
        getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(partialHash.length).toBeGreaterThan(0)

      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, true, false], { activeIndex: 1, progress: 0.5, tx: -1000 }),
      )
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const heldHash =
        getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(heldHash).toBe(partialHash)
    })

    it('starts typewriter on the newest panel at section entry', () => {
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const newestPartial =
        getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      const middlePartial =
        getTimelinePanel(1).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''

      expect(newestPartial.length).toBeGreaterThan(0)
      expect(middlePartial).toBe('')
    })

    it('restarts typing on a panel when scroll reactivates it', () => {
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialHash =
        getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(partialHash.length).toBeGreaterThan(0)

      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, true, false], { activeIndex: 1, progress: 0.5, tx: -1000 }),
      )
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const heldHash =
        getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(heldHash).toBe(partialHash)

      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([true, false, false], { activeIndex: 0, progress: 0, tx: -2000 }),
      )
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(200)
      })

      const resumedHash =
        getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(resumedHash).toBe(partialHash)
      expect(getTimelinePanel(0).querySelector('[data-testid="commit-institution"]')).toBeNull()
    })
  })
})
