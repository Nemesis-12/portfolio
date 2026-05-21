import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import TimelineSection from './TimelineSection'
import { useActivePanel } from '../hooks/useActivePanel'

vi.mock('../hooks/useActivePanel', () => ({
  useActivePanel: vi.fn(() => ({ active: [false, false, false], setRef: () => () => {} })),
}))

describe('TimelineSection', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('each entry has min-h-screen', () => {
    render(<TimelineSection />)
    const commitEntries = screen.getAllByTestId('commit-entry')
    expect(commitEntries.length).toBe(3)
    commitEntries.forEach((entry) => {
      expect(entry).toHaveClass('min-h-screen')
    })
  })

  it('entries start empty when no panel is active', () => {
    vi.mocked(useActivePanel).mockReturnValue({
      active: [false, false, false],
      setRef: () => () => {},
    })

    render(<TimelineSection />)

    const typewriterLines = document.querySelectorAll('[data-typewriter-line]')
    expect(typewriterLines.length).toBe(0)
  })

  describe('issue #78 - newest-first ordering', () => {
    it('entries render in newest-first order (NetApp before M.S. before B.S.)', () => {
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, true, true],
        setRef: () => () => {},
      })
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
      expect(labelTexts).toContain('// EXPERIENCE')
      expect(labelTexts).toContain('// EDUCATION')
    })

    it('section labels use font-display (pixel font) in orange', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      sectionLabels.forEach((label) => {
        expect(label.className).toContain('font-display')
        expect(label.className).toContain('text-atomic-tangerine')
        expect(label.className).not.toContain('font-body')
      })
    })

    it('section label // is smaller than section word', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      sectionLabels.forEach((label) => {
        const slash = label.querySelector('span:first-child')
        const word = label.querySelector('span:last-child')
        expect(slash?.className).toContain('text-xs')
        expect(word?.className).toContain('text-sm')
      })
    })

    it('Typewriter types commit metadata when panel becomes active', () => {
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
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
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
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
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
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
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
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
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''

      vi.mocked(useActivePanel).mockReturnValue({
        active: [false, false, false],
        setRef: () => () => {},
      })
      rerender(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const heldText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(heldText).toBe(partialText)
    })

    it('Typewriter resumes from held position when panel becomes active again', () => {
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })
      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''

      vi.mocked(useActivePanel).mockReturnValue({
        active: [false, false, false],
        setRef: () => () => {},
      })
      rerender(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
      rerender(<TimelineSection />)
      act(() => {
        vi.advanceTimersByTime(500)
      })

      const resumedText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(resumedText.length).toBeGreaterThan(partialText.length)
    })

    it('issue #98 - longest bullet completes within 2.5s', () => {
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
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
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const panel1Partial = commitEntries[0].querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(panel1Partial.length).toBeGreaterThan(0)

      vi.mocked(useActivePanel).mockReturnValue({
        active: [false, true, false],
        setRef: () => () => {},
      })
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
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(partialText.length).toBeGreaterThan(0)

      vi.mocked(useActivePanel).mockReturnValue({
        active: [false, false, false],
        setRef: () => () => {},
      })
      rerender(<TimelineSection />)

      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
      rerender(<TimelineSection />)

      const immediateText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(immediateText).toBe(partialText)
    })

    it('each panel retains independent partial progress when switching panels', () => {
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const panel1Partial =
        commitEntries[0].querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(panel1Partial.length).toBeGreaterThan(0)

      vi.mocked(useActivePanel).mockReturnValue({
        active: [false, true, false],
        setRef: () => () => {},
      })
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

      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
      rerender(<TimelineSection />)

      const panel1Immediate =
        commitEntries[0].querySelector('[data-typewriter-line]')?.textContent ?? ''
      const panel2Held =
        commitEntries[1].querySelector('[data-typewriter-line]')?.textContent ?? ''

      expect(panel1Immediate).toBe(panel1Partial)
      expect(panel2Held).toBe(panel2Partial)
    })

    it('completed panel text remains when next panel activates', () => {
      vi.mocked(useActivePanel).mockReturnValue({
        active: [true, false, false],
        setRef: () => () => {},
      })
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

      vi.mocked(useActivePanel).mockReturnValue({
        active: [false, true, false],
        setRef: () => () => {},
      })
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
})
