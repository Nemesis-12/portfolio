import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import TimelineSection from './TimelineSection'
import { useActivePanel } from '../hooks/useActivePanel'

const noopSetRef = () => () => {}

function mockActivePanelState(
  active: boolean[],
  options: { activeIndex?: number; progress?: number } = {},
) {
  const detectedIndex = active.findIndex(Boolean)
  return {
    active,
    activeIndex: options.activeIndex ?? (detectedIndex === -1 ? 0 : detectedIndex),
    progress: options.progress ?? 0,
    setRef: noopSetRef,
  }
}

vi.mock('../hooks/useActivePanel', () => ({
  useActivePanel: vi.fn(() => mockActivePanelState([false, false, false])),
}))

describe('TimelineSection', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('each entry uses tl-panel layout class', () => {
    render(<TimelineSection />)
    const commitEntries = screen.getAllByTestId('commit-entry')
    expect(commitEntries.length).toBe(3)
    commitEntries.forEach((entry) => {
      expect(entry).toHaveClass('tl-panel')
    })
  })

  it('entries start empty when no panel is active', () => {
    vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, false, false]))

    render(<TimelineSection />)

    const typewriterLines = document.querySelectorAll('[data-typewriter-line]')
    expect(typewriterLines.length).toBe(0)
  })

  describe('issue #78 - newest-first ordering', () => {
    it('entries render in newest-first order (NetApp before M.S. before B.S.)', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, true, true]))
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const texts = Array.from(allLines)
        .map((el) => el.textContent)
        .filter((t) => t !== '')

      expect(texts[0]).toBe('commit d4e8f2c')
      expect(texts[3]).toBe('NETAPP INC.')
      expect(texts[4]).toBe('SOFTWARE_ENGINEER_IN_TEST')

      expect(texts[9]).toBe('commit a3f9d2b')
      expect(texts[12]).toBe('WICHITA STATE UNIVERSITY')
      expect(texts[13]).toBe('ACCELERATED_M.S._COMPUTER_SCIENCE')

      expect(texts[14]).toBe('commit b7c3e1a')
      expect(texts[17]).toBe('WICHITA STATE UNIVERSITY')
      expect(texts[18]).toBe('B.S._COMPUTER_SCIENCE')
    })
  })

  describe('issue #97 - full-screen stacked panels', () => {
    it('each timeline entry is its own sticky section panel', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"]')
      expect(stickyPanels.length).toBe(3)

      stickyPanels.forEach((panel) => {
        expect(panel).toHaveClass('min-h-screen')
        expect(panel).toHaveClass('sticky')
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
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
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
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
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
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
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
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(100)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const panel2Lines = commitEntries[1].querySelectorAll('[data-typewriter-line]')
      const panel3Lines = commitEntries[2].querySelectorAll('[data-typewriter-line]')
      expect(panel2Lines.length).toBe(0)
      expect(panel3Lines.length).toBe(0)
    })

    it('Typewriter holds position when panel is scrolled away mid-type', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, false, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const heldText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(heldText).toBe(partialText)
    })

    it('Typewriter resumes from held position when panel becomes active again', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })
      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, false, false]))
      rerender(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      rerender(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(500)
      })

      const resumedText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(resumedText.length).toBeGreaterThan(partialText.length)
    })

    it('issue #98 - longest bullet completes within 2.5s', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
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
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const panel1Partial = commitEntries[0].querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(panel1Partial.length).toBeGreaterThan(0)

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, true, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const panel1Held = commitEntries[0].querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(panel1Held).toBe(panel1Partial)

      const panel2Lines = commitEntries[1].querySelectorAll('[data-typewriter-line]')
      expect(panel2Lines.length).toBeGreaterThan(0)
    })

    it('reactivate does not blank partial text before resuming', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(partialText.length).toBeGreaterThan(0)

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, false, false]))
      rerender(<TimelineSection />)

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      rerender(<TimelineSection />)

      const immediateText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(immediateText).toBe(partialText)
    })

    it('each panel retains independent partial progress when switching panels', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const panel1Partial =
        commitEntries[0].querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(panel1Partial.length).toBeGreaterThan(0)

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, true, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const panel1Held =
        commitEntries[0].querySelector('[data-typewriter-line]')?.textContent ?? ''
      const panel2Partial =
        commitEntries[1].querySelector('[data-typewriter-line]')?.textContent ?? ''

      expect(panel1Held).toBe(panel1Partial)
      expect(panel2Partial.length).toBeGreaterThan(0)

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      rerender(<TimelineSection />)

      const panel1Immediate =
        commitEntries[0].querySelector('[data-typewriter-line]')?.textContent ?? ''
      const panel2Held =
        commitEntries[1].querySelector('[data-typewriter-line]')?.textContent ?? ''

      expect(panel1Immediate).toBe(panel1Partial)
      expect(panel2Held).toBe(panel2Partial)
    })

    it('completed panel text remains when next panel activates', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const panel1Texts = Array.from(
        commitEntries[0].querySelectorAll('[data-typewriter-line]')
      ).map((el) => el.textContent)

      expect(panel1Texts).toContain('commit d4e8f2c')
      expect(panel1Texts).toContain('NETAPP INC.')

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, true, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const panel1TextsAfter = Array.from(
        commitEntries[0].querySelectorAll('[data-typewriter-line]')
      ).map((el) => el.textContent)

      expect(panel1TextsAfter).toContain('commit d4e8f2c')
      expect(panel1TextsAfter).toContain('NETAPP INC.')
    })
  })

  describe('issue #160 - structured resume-backed panel content', () => {
    it('renders commit metadata as distinct fields', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const metadata = commitEntries[0].querySelector('[data-testid="commit-metadata"]')
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
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const institution = commitEntries[0].querySelector('[data-testid="commit-institution"]')
      expect(institution?.tagName).toBe('H2')
      expect(institution?.textContent).toBe('NETAPP INC.')
    })

    it('renders role as its own line', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const role = commitEntries[0].querySelector('[data-testid="commit-role"]')
      expect(role?.textContent).toBe('SOFTWARE_ENGINEER_IN_TEST')
    })

    it('renders bullets as semantic list items', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const details = commitEntries[0].querySelector('[data-testid="commit-details"]')
      expect(details?.tagName).toBe('UL')

      const items = details?.querySelectorAll('li') ?? []
      expect(items.length).toBe(4)
      expect(items[0].textContent).toContain('Built automated analysis pipeline')
    })

    it('preserves data-typewriter-line markers on typed fields', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const typedFields = commitEntries[0].querySelectorAll('[data-typewriter-line]')
      expect(typedFields.length).toBeGreaterThan(0)
      expect(typedFields[0].closest('[data-testid="commit-metadata"]')).toBeTruthy()
    })

    it('omits commit-details list when entry has no bullets', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, true, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const msPanel = commitEntries[1]
      expect(msPanel.querySelector('[data-testid="commit-details"]')).not.toBeInTheDocument()
      expect(msPanel.querySelector('[data-testid="commit-institution"]')?.textContent).toBe(
        'WICHITA STATE UNIVERSITY'
      )
    })

    it('holds partial metadata within structured fields when panel deactivates', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const partialHash =
        commitEntries[0].querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(partialHash.length).toBeGreaterThan(0)

      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([false, false, false]))
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const heldEntries = screen.getAllByTestId('commit-entry')
      const heldHash =
        heldEntries[0].querySelector('[data-testid="commit-hash"]')?.textContent ?? ''
      expect(heldHash).toBe(partialHash)
      expect(heldEntries[0].querySelector('[data-testid="commit-institution"]')).toBeNull()
    })
  })

  describe('issue #161 - v4 desktop panel visual hierarchy', () => {
    it('commit hash uses tl-commit, author and date use tl-meta', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const metadata = commitEntries[0].querySelector('[data-testid="commit-metadata"]')
      expect(metadata?.querySelector('[data-testid="commit-hash"]')).toHaveClass('tl-commit')
      expect(metadata?.querySelector('[data-testid="commit-author"]')).toHaveClass('tl-meta')
      expect(metadata?.querySelector('[data-testid="commit-date"]')).toHaveClass('tl-meta')
    })

    it('institution heading uses tl-org portfolio class', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const institution = commitEntries[0].querySelector('[data-testid="commit-institution"]')
      expect(institution).toHaveClass('tl-org')
      expect(institution?.textContent).toBe('NETAPP INC.')
    })

    it('role uses tl-title portfolio class', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const role = commitEntries[0].querySelector('[data-testid="commit-role"]')
      expect(role).toHaveClass('tl-title')
      expect(role?.textContent).toBe('SOFTWARE_ENGINEER_IN_TEST')
    })

    it('bullets use tl-bullets portfolio class', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const details = commitEntries[0].querySelector('[data-testid="commit-details"]')
      expect(details).toHaveClass('tl-bullets')
    })

    it('section tag carries experience or education category class', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      expect(sectionLabels[0].className).toContain('experience')
      expect(sectionLabels[1].className).toContain('education')
      expect(sectionLabels[2].className).toContain('education')
    })

    it('inserts tl-sep spacer before institution heading', () => {
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(15000)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const institution = commitEntries[0].querySelector('[data-testid="commit-institution"]')
      expect(institution?.previousElementSibling).toHaveClass('tl-sep')
    })
  })

  describe('issue #157 - desktop sticky panel scroll contract', () => {
    it('timeline panels do not use horizontal scroll or translateX', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"]')
      stickyPanels.forEach((panel) => {
        const style = (panel as HTMLElement).style
        expect(style.transform).not.toContain('translateX')
        expect(style.transform).not.toContain('translate3d')
      })
    })

    it('timeline panels do not have a horizontal track element', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"]')
      stickyPanels.forEach((panel) => {
        const children = panel.querySelectorAll('[data-testid]')
        const hasTrack = Array.from(children).some(
          (child) =>
            child.getAttribute('data-testid')?.includes('track') ||
            child.getAttribute('data-testid')?.includes('carousel')
        )
        expect(hasTrack).toBe(false)
      })
    })

    it('each timeline panel participates in card-deck stack with z-index', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"]')
      expect(stickyPanels.length).toBe(3)

      stickyPanels.forEach((panel) => {
        const zIndex = (panel as HTMLElement).style.zIndex
        expect(zIndex).toBeTruthy()
        expect(Number(zIndex)).toBeGreaterThan(0)
      })
    })

    it('each timeline panel occupies a full desktop viewport beat (min-h-screen)', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"]')
      stickyPanels.forEach((panel) => {
        expect(panel).toHaveClass('min-h-screen')
        expect(panel).toHaveClass('sticky')
        expect(panel).toHaveClass('top-0')
      })
    })

    it('timeline panels are in DOM order matching newest-first scroll progression', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"][id]')
      const ids = Array.from(stickyPanels).map((p) => p.id)

      expect(ids[0]).toBe('timeline')
      expect(ids[1]).toBe('timeline-a3f9d2b')
      expect(ids[2]).toBe('timeline-b7c3e1a')
    })

    it('timeline panels have origin-center and transform-gpu for card-deck animations', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"]')
      stickyPanels.forEach((panel) => {
        expect(panel).toHaveClass('origin-center')
        expect(panel).toHaveClass('transform-gpu')
      })
    })

    it('timeline panels have willChange set for GPU compositing', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"]')
      stickyPanels.forEach((panel) => {
        expect((panel as HTMLElement).style.willChange).toBe('transform, opacity')
      })
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
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))

      render(<TimelineSection />)

      expect(screen.getByTestId('progress-count')).toHaveTextContent('01 / 03')
    })

    it('progress counter advances with active panel index', () => {
      vi.mocked(useActivePanel).mockReturnValue(
        mockActivePanelState([false, true, false], { activeIndex: 1, progress: 0.5 }),
      )

      render(<TimelineSection />)

      expect(screen.getByTestId('progress-count')).toHaveTextContent('02 / 03')
    })

    it('progress fill width reflects scroll progress', () => {
      vi.mocked(useActivePanel).mockReturnValue(
        mockActivePanelState([false, true, false], { activeIndex: 1, progress: 0.5 }),
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
      vi.mocked(useActivePanel).mockReturnValue(mockActivePanelState([true, false, false]))

      render(<TimelineSection />)

      const hint = screen.getByTestId('scroll-hint')
      expect(hint).toHaveTextContent(/SCROLL/)
      expect(hint).toHaveTextContent(/↓/)
      expect(hint).toHaveAttribute('data-visible', 'true')
      expect(hint).toHaveClass('hscroll-hint')
    })

    it('hides scroll hint after first panel beat', () => {
      vi.mocked(useActivePanel).mockReturnValue(
        mockActivePanelState([false, true, false], { activeIndex: 1, progress: 0.5 }),
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
