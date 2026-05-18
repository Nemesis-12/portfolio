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
    commitEntries.forEach(entry => {
      expect(entry).toHaveClass('min-h-screen')
    })
  })

  it('entries start empty when no panel is active', () => {
    vi.mocked(useActivePanel).mockReturnValue({ active: [false, false, false], setRef: () => () => {} })

    render(<TimelineSection />)

    const typewriterLines = document.querySelectorAll('[data-typewriter-line]')
    expect(typewriterLines.length).toBe(0)
  })

  describe('issue #78 - newest-first ordering', () => {
    it('entries render in newest-first order (NetApp before M.S. before B.S.)', () => {
      vi.mocked(useActivePanel).mockReturnValue({ active: [true, true, true], setRef: () => () => {} })
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => { vi.advanceTimersByTime(15000) })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const texts = Array.from(allLines).map(el => el.textContent)

      // First 9 lines belong to panel 0 (NetApp: 5 metadata + 4 bullets)
      expect(texts[0]).toBe('commit d4e8f2c')
      expect(texts[3]).toBe('NETAPP INC.')
      expect(texts[4]).toBe('SOFTWARE_ENGINEER_IN_TEST')

      // Next 6 lines belong to panel 1 (M.S.: 5 metadata + 0 bullets + 1 empty)
      expect(texts[9]).toBe('commit a3f9d2b')
      expect(texts[12]).toBe('WICHITA STATE UNIVERSITY')
      expect(texts[13]).toBe('ACCELERATED_M.S._COMPUTER_SCIENCE')

      // Next 7 lines belong to panel 2 (B.S.: 5 metadata + 2 bullets)
      expect(texts[15]).toBe('commit b7c3e1a')
      expect(texts[18]).toBe('WICHITA STATE UNIVERSITY')
      expect(texts[19]).toBe('B.S._COMPUTER_SCIENCE')
    })
  })

  describe('issue #97 - full-screen stacked panels', () => {
    it('each timeline entry is its own sticky section panel', () => {
      render(<TimelineSection />)

      const stickyPanels = document.querySelectorAll('[data-sticky-section="true"]')
      expect(stickyPanels.length).toBe(3)

      stickyPanels.forEach(panel => {
        expect(panel).toHaveClass('min-h-screen')
        expect(panel).toHaveClass('sticky')
      })
    })

    it('each panel has a section label (EXPERIENCE or EDUCATION)', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      expect(sectionLabels.length).toBe(3)

      const labelTexts = Array.from(sectionLabels).map(el => el.textContent)
      expect(labelTexts).toContain('// EXPERIENCE')
      expect(labelTexts).toContain('// EDUCATION')
    })

    it('section labels use font-display (pixel font) in orange', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      sectionLabels.forEach(label => {
        expect(label.className).toContain('font-display')
        expect(label.className).toContain('text-atomic-tangerine')
        expect(label.className).not.toContain('font-body')
      })
    })

    it('section label // is smaller than section word', () => {
      render(<TimelineSection />)

      const sectionLabels = document.querySelectorAll('[data-testid="section-label"]')
      sectionLabels.forEach(label => {
        const slash = label.querySelector('span:first-child')
        const word = label.querySelector('span:last-child')
        expect(slash?.className).toContain('text-xs')
        expect(word?.className).toContain('text-sm')
      })
    })

    it('Typewriter types commit metadata when panel becomes active', () => {
      vi.mocked(useActivePanel).mockReturnValue({ active: [true, false, false], setRef: () => () => {} })
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(500) })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const firstPanelLines = Array.from(allLines).filter((_, i) => i < 5)
      expect(firstPanelLines.length).toBeGreaterThan(0)
      expect(firstPanelLines[0].textContent).toBe('commit d4e8f2c')
    })

    it('Typewriter types all fields to completion when panel stays active', () => {
      vi.mocked(useActivePanel).mockReturnValue({ active: [true, false, false], setRef: () => () => {} })
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(15000) })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const texts = Array.from(allLines).map(el => el.textContent)

      expect(texts).toContain('commit d4e8f2c')
      expect(texts).toContain('Author: Farhan Mohammed')
      expect(texts).toContain('Date:   AUG 2024 – PRESENT')
      expect(texts).toContain('NETAPP INC.')
      expect(texts).toContain('SOFTWARE_ENGINEER_IN_TEST')
    })

    it('Typewriter types bullets when present', () => {
      vi.mocked(useActivePanel).mockReturnValue({ active: [true, false, false], setRef: () => () => {} })
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(15000) })

      const allLines = document.querySelectorAll('[data-typewriter-line]')
      const texts = Array.from(allLines).map(el => el.textContent)

      expect(texts.some(t => t?.includes('Built automated analysis pipeline'))).toBe(true)
    })

    it('inactive panels remain empty', () => {
      vi.mocked(useActivePanel).mockReturnValue({ active: [true, false, false], setRef: () => () => {} })
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => { vi.advanceTimersByTime(100) })

      const commitEntries = screen.getAllByTestId('commit-entry')
      const panel2Lines = commitEntries[1].querySelectorAll('[data-typewriter-line]')
      const panel3Lines = commitEntries[2].querySelectorAll('[data-typewriter-line]')
      expect(panel2Lines.length).toBe(0)
      expect(panel3Lines.length).toBe(0)
    })

    it('Typewriter holds position when panel is scrolled away mid-type', () => {
      vi.mocked(useActivePanel).mockReturnValue({ active: [true, false, false], setRef: () => () => {} })
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(100) })

      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''

      vi.mocked(useActivePanel).mockReturnValue({ active: [false, false, false], setRef: () => () => {} })
      rerender(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(5000) })

      const heldText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(heldText).toBe(partialText)
    })

    it('Typewriter resumes from held position when panel becomes active again', () => {
      vi.mocked(useActivePanel).mockReturnValue({ active: [true, false, false], setRef: () => () => {} })
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(100) })
      const partialText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''

      vi.mocked(useActivePanel).mockReturnValue({ active: [false, false, false], setRef: () => () => {} })
      rerender(<TimelineSection />)
      act(() => { vi.advanceTimersByTime(1000) })

      vi.mocked(useActivePanel).mockReturnValue({ active: [true, false, false], setRef: () => () => {} })
      rerender(<TimelineSection />)
      act(() => { vi.advanceTimersByTime(500) })

      const resumedText = document.querySelector('[data-typewriter-line]')?.textContent ?? ''
      expect(resumedText.length).toBeGreaterThan(partialText.length)
    })
  })
})
