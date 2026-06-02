import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import TimelineSection from './TimelineSection'
import { getTimelineTrackTranslate } from './timelineGeometry'
import { useTimelineScroll } from '../hooks/useTimelineScroll'

const timelineSectionSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'TimelineSection.tsx'),
  'utf8',
)

const DEFAULT_ACTIVE = [true, false, false] as const

function mockTimelineScrollState(
  active: boolean[],
  options: { activeIndex?: number; progress?: number; tx?: number } = {},
) {
  const detectedIndex = active.findIndex(Boolean)
  const activeIndex = options.activeIndex ?? (detectedIndex === -1 ? 0 : detectedIndex)
  const entryCount = active.length

  return {
    active,
    activeIndex,
    progress: options.progress ?? (entryCount <= 1 ? 0 : activeIndex / (entryCount - 1)),
    tx: options.tx ?? getTimelineTrackTranslate(activeIndex, entryCount, 1000),
  }
}

vi.mock('../hooks/useTimelineScroll', () => ({
  useTimelineScroll: vi.fn(() => mockTimelineScrollState([...DEFAULT_ACTIVE])),
}))

function getTimelinePanel(contentIndex: number) {
  return document.querySelector(`[data-content-index="${contentIndex}"]`) as HTMLElement
}

describe('TimelineSection', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([...DEFAULT_ACTIVE]))
  })

  it('each entry uses tl-panel layout class', () => {
    render(<TimelineSection />)
    const commitEntries = screen.getAllByTestId('commit-entry')
    expect(commitEntries.length).toBe(3)
    commitEntries.forEach((entry) => {
      expect(entry).toHaveClass('tl-panel')
    })
  })

  it('entries stay empty when scroll state marks every panel inactive', () => {
    vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, false, false]))

    render(<TimelineSection />)

    const typewriterLines = document.querySelectorAll('[data-typewriter-line]')
    expect(typewriterLines.length).toBe(0)
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

  describe('issue #97 - full-screen stacked panels', () => {
    it('timeline entries are full-viewport panels inside one horizontal track', () => {
      render(<TimelineSection />)

      const timelineSection = document.getElementById('timeline')
      const track = document.querySelector('[data-timeline-track="true"]')
      const panels = document.querySelectorAll('[data-testid="timeline-panel"]')

      expect(timelineSection).toBeInTheDocument()
      expect(track).toBeInTheDocument()
      expect(panels).toHaveLength(3)
      panels.forEach((panel) => {
        expect(panel.querySelector('.tl-panel')).toBeInTheDocument()
      })
    })

    it('each panel has a section label (EXPERIENCE or EDUCATION)', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      expect(sectionLabels.length).toBe(3)

      const labelTexts = Array.from(sectionLabels).map((el) => el.textContent)
      expect(labelTexts).toContain('//EXPERIENCE')
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
      expect(firstPanelLines[0].textContent).toBe('commit d4e8f2c')
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

      expect(texts).toContain('commit d4e8f2c')
      expect(texts).toContain('Author: Farhan Mohammed')
      expect(texts).toContain('Date:   AUG 2024 – PRESENT')
      expect(texts).toContain('NETAPP INC.')
      expect(texts).toContain('SOFTWARE_ENGINEER_IN_TEST')
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

      expect(texts.some((text) => text?.includes('Built automated analysis pipeline'))).toBe(true)
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

    it('Typewriter resumes from held position when panel becomes active again', () => {
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
        vi.advanceTimersByTime(500)
      })

      const resumedText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(resumedText.length).toBeGreaterThan(partialText.length)
    })

    it('issue #98 - longest bullet completes within 2.5s', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
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

    it('reactivate does not blank partial text before resuming', () => {
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

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      rerender(<TimelineSection />)

      const immediateText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(immediateText).toBe(partialText)
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

      const panel1Immediate =
        getTimelinePanel(0).querySelector('[data-typewriter-line]')?.textContent ?? ''
      const panel2Held =
        getTimelinePanel(1).querySelector('[data-typewriter-line]')?.textContent ?? ''

      expect(panel1Immediate).toBe(panel1Partial)
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

      expect(panel1Texts).toContain('commit d4e8f2c')
      expect(panel1Texts).toContain('NETAPP INC.')

      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, true, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const panel1TextsAfter = Array.from(
        getTimelinePanel(0).querySelectorAll('[data-typewriter-line]'),
      ).map((el) => el.textContent)

      expect(panel1TextsAfter).toContain('commit d4e8f2c')
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
        'commit d4e8f2c'
      )
      expect(metadata?.querySelector('[data-testid="commit-author"]')?.textContent).toBe(
        'Author: Farhan Mohammed'
      )
      expect(metadata?.querySelector('[data-testid="commit-date"]')?.textContent).toBe(
        'Date:   AUG 2024 – PRESENT'
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
      expect(role?.textContent).toBe('SOFTWARE_ENGINEER_IN_TEST')
    })

    it('renders bullets as semantic list items', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const details = getTimelinePanel(0).querySelector('[data-testid="commit-details"]')
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

    it('omits commit-details list when entry has no bullets', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([false, true, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const msPanel = getTimelinePanel(1)
      expect(msPanel.querySelector('[data-testid="commit-details"]')).not.toBeInTheDocument()
      expect(msPanel.querySelector('[data-testid="commit-institution"]')?.textContent).toBe(
        'WICHITA STATE UNIVERSITY'
      )
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
      expect(role?.textContent).toBe('SOFTWARE_ENGINEER_IN_TEST')
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
        'education',
      )
      expect(getTimelinePanel(2).querySelector('[data-testid="section-label"]')?.className).toContain(
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
      expect(panels).toHaveLength(3)
    })

    it('renders one snap anchor per timeline entry', () => {
      render(<TimelineSection />)

      const timeline = document.getElementById('timeline')
      const anchors = timeline?.querySelectorAll('.snap-anchor')

      expect(anchors).toHaveLength(3)
      expect(anchors?.[0]).toHaveStyle({ top: '0vh' })
      expect(anchors?.[1]).toHaveStyle({ top: '100vh' })
      expect(anchors?.[2]).toHaveStyle({ top: '200vh' })
    })

    it('uses one viewport of section height per entry', () => {
      render(<TimelineSection />)

      const timeline = document.getElementById('timeline')
      expect(timeline).toHaveStyle({ height: '300vh' })
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

      expect(contentIndexes).toEqual(['2', '1', '0'])
      expect(panels[2]?.getAttribute('data-content-index')).toBe('0')
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

  describe('issue #206 - timeline section chrome', () => {
    it('renders // 03 TIMELINE header with hscroll classes', () => {
      render(<TimelineSection />)

      expect(document.querySelector('.hscroll-head')).toBeInTheDocument()
      expect(document.querySelector('.hscroll-no')?.textContent).toBe('// 03')
      expect(document.querySelector('.hscroll-name')?.textContent).toBe('TIMELINE')
      expect(document.querySelector('.hscroll-rule')).toBeInTheDocument()
    })

    it('renders progress counter with resume entry count 01 / 03', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(mockTimelineScrollState([true, false, false]))

      render(<TimelineSection />)

      expect(screen.getByTestId('progress-count')).toHaveTextContent('01 / 03')
    })

    it('progress counter advances with active panel index', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, true, false], { activeIndex: 1, progress: 0.5 }),
      )

      render(<TimelineSection />)

      expect(screen.getByTestId('progress-count')).toHaveTextContent('02 / 03')
    })

    it('progress fill width reflects scroll progress', () => {
      vi.mocked(useTimelineScroll).mockReturnValue(
        mockTimelineScrollState([false, true, false], { activeIndex: 1, progress: 0.5 }),
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
        mockTimelineScrollState([false, true, false], { activeIndex: 1, progress: 0.5 }),
      )

      render(<TimelineSection />)

      expect(screen.getByTestId('scroll-hint')).toHaveAttribute('data-visible', 'false')
    })

    it('scroll hint is visually secondary (aria-hidden)', () => {
      render(<TimelineSection />)

      expect(screen.getByTestId('scroll-hint')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('issue #221 - active panel progression and typewriter persistence', () => {
    it('activates the newest entry by default from useTimelineScroll', () => {
      render(<TimelineSection />)

      expect(useTimelineScroll).toHaveBeenCalledWith(expect.objectContaining({ current: null }), 3)
      expect(getTimelinePanel(0).getAttribute('data-content-index')).toBe('0')
      expect(getTimelinePanel(0).querySelector('[data-testid="commit-hash"]')).toBeNull()
    })

    it('derives active panels from useTimelineScroll instead of useActivePanel', () => {
      expect(timelineSectionSource).toContain('useTimelineScroll')
      expect(timelineSectionSource).not.toContain('useActivePanel')
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
          `${String(scenario.activeIndex + 1).padStart(2, '0')} / 03`,
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

    it('resumes typing on a panel when scroll reactivates it', () => {
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
      expect(resumedHash.length).toBeGreaterThan(partialHash.length)
    })
  })
})
