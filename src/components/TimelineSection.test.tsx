import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useInView } from 'framer-motion'
import TimelineSection from './TimelineSection'

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return { ...actual, useInView: vi.fn().mockReturnValue(false) }
})

describe('TimelineSection', () => {
  beforeEach(() => {
    vi.mocked(useInView).mockReturnValue(false)
  })

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

  it('entries start empty (typewriter effect)', () => {
    render(<TimelineSection />)

    const hashElements = screen.getAllByTestId('commit-hash')
    const authorElements = screen.getAllByTestId('commit-author')
    const dateElements = screen.getAllByTestId('commit-date')
    const institutionElements = screen.getAllByTestId('commit-institution')
    const roleElements = screen.getAllByTestId('commit-role')
    const bulletElements = screen.getAllByTestId('commit-description')

    expect(hashElements.length).toBe(3)
    expect(authorElements.length).toBe(3)
    expect(dateElements.length).toBe(3)
    expect(institutionElements.length).toBe(3)
    expect(roleElements.length).toBe(3)
    expect(bulletElements.length).toBe(6)

    hashElements.forEach(el => expect(el).toHaveTextContent(''))
    authorElements.forEach(el => expect(el).toHaveTextContent(''))
    dateElements.forEach(el => expect(el).toHaveTextContent(''))
    institutionElements.forEach(el => expect(el).toHaveTextContent(''))
    roleElements.forEach(el => expect(el).toHaveTextContent(''))
    bulletElements.forEach(el => expect(el).toHaveTextContent(''))
  })

  it('renders bullets as li elements in ul, not as p elements', () => {
    vi.mocked(useInView).mockReturnValue(true)
    vi.useFakeTimers()

    render(<TimelineSection />)
    act(() => { vi.advanceTimersByTime(15000) })

    const commitEntries = screen.getAllByTestId('commit-entry')

    // NetApp (index 0) has 4 bullets
    expect(commitEntries[0].querySelectorAll('ul')).toHaveLength(1)
    expect(commitEntries[0].querySelectorAll('li')).toHaveLength(4)
    expect(commitEntries[0].querySelectorAll('ul p')).toHaveLength(0)

    // M.S. (index 1) has 0 bullets
    expect(commitEntries[1].querySelector('ul')).not.toBeInTheDocument()
    expect(commitEntries[1].querySelectorAll('li')).toHaveLength(0)

    // B.S. (index 2) has 2 bullets
    expect(commitEntries[2].querySelectorAll('ul')).toHaveLength(1)
    expect(commitEntries[2].querySelectorAll('li')).toHaveLength(2)
    expect(commitEntries[2].querySelectorAll('ul p')).toHaveLength(0)
  })

  it('has bullets with correct resume text', () => {
    vi.mocked(useInView).mockReturnValue(true)
    vi.useFakeTimers()

    render(<TimelineSection />)
    act(() => { vi.advanceTimersByTime(15000) })

    const bulletTexts = screen.getAllByTestId('commit-description').map(li => li.textContent)

    // Newest-first: NetApp bullets first, then B.S. bullets
    expect(bulletTexts).toEqual([
      'Built automated analysis pipeline processing storage telemetry across distributed RAID systems (FC, SAS, NVMe/RoCE), handling terabytes of performance data.',
      'Designed Python automation framework reducing manual configuration tasks by 30% across Linux, Windows, and VMware infrastructure.',
      'Implemented Ansible-based deployment orchestration for 300+ system configurations, streamlining infrastructure provisioning workflows.',
      'Developed interactive visualization dashboard for system performance metrics using Python, analyzing 1M+ database entries for engineering insights.',
      "Dean's List: Spring 2022 – Fall 2025",
      'Relevant Coursework: Machine Learning, Artificial Intelligence, Fundamentals of AI Agents, Data Science',
    ])
  })

  describe('issue #78 - newest-first ordering', () => {
    it('entries render in newest-first order (NetApp before M.S. before B.S.)', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      render(<TimelineSection />)
      act(() => { vi.advanceTimersByTime(15000) })

      const institutions = screen.getAllByTestId('commit-institution')
      expect(institutions[0].textContent).toBe('NETAPP INC.')
      expect(institutions[1].textContent).toBe('WICHITA STATE UNIVERSITY')
      expect(institutions[2].textContent).toBe('WICHITA STATE UNIVERSITY')

      const roles = screen.getAllByTestId('commit-role')
      expect(roles[0].textContent).toBe('SOFTWARE_ENGINEER_IN_TEST')
      expect(roles[1].textContent).toBe('ACCELERATED_M.S._COMPUTER_SCIENCE')
      expect(roles[2].textContent).toBe('B.S._COMPUTER_SCIENCE')
    })

    it('does not render Education/Experience subsection headings', () => {
      render(<TimelineSection />)

      expect(screen.queryByText('EDUCATION')).not.toBeInTheDocument()
      expect(screen.queryByText('EXPERIENCE')).not.toBeInTheDocument()
    })
  })

  describe('issue #47 - scroll-triggered typewriter', () => {
    it('text begins populating when entry enters the viewport', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      render(<TimelineSection />)

      // Advance past first field's typing: "commit a3f9d2b" = 15 chars × 30ms = 450ms
      act(() => { vi.advanceTimersByTime(1000) })

      screen.getAllByTestId('commit-hash').forEach(el => {
        expect(el.textContent).not.toBe('')
      })
    })

    it('all text fields complete with expected content', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      render(<TimelineSection />)

      // Longest entry: NetApp description ~351 chars → 1000ms delay + 351×30ms ≈ 11.5s
      act(() => { vi.advanceTimersByTime(15000) })

      const hashes = screen.getAllByTestId('commit-hash')
      expect(hashes[0].textContent).toBe('commit d4e8f2c')
      expect(hashes[1].textContent).toBe('commit a3f9d2b')
      expect(hashes[2].textContent).toBe('commit b7c3e1a')

      screen.getAllByTestId('commit-author').forEach(el => {
        expect(el.textContent).toBe('Author: Farhan Mohammed')
      })

      const dates = screen.getAllByTestId('commit-date')
      expect(dates[0].textContent).toBe('Date:   AUG 2024 – PRESENT')
      expect(dates[1].textContent).toBe('Date:   JAN 2026 – DEC 2027 (EXPECTED)')
      expect(dates[2].textContent).toBe('Date:   JAN 2022 – DEC 2025')

      const institutions = screen.getAllByTestId('commit-institution')
      expect(institutions[0].textContent).toBe('NETAPP INC.')
      expect(institutions[1].textContent).toBe('WICHITA STATE UNIVERSITY')
      expect(institutions[2].textContent).toBe('WICHITA STATE UNIVERSITY')

      const roles = screen.getAllByTestId('commit-role')
      expect(roles[0].textContent).toBe('SOFTWARE_ENGINEER_IN_TEST')
      expect(roles[1].textContent).toBe('ACCELERATED_M.S._COMPUTER_SCIENCE')
      expect(roles[2].textContent).toBe('B.S._COMPUTER_SCIENCE')
    })

    it('does not render the superseded M.S. date range', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      render(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(15000) })

      expect(screen.queryByText('Date:   JAN 2026 – PRESENT')).not.toBeInTheDocument()
    })

    it('typing does not restart when viewport is re-entered', () => {
      vi.mocked(useInView).mockReturnValue(true)
      vi.useFakeTimers()

      const { rerender } = render(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(15000) })

      const completedHashes = screen.getAllByTestId('commit-hash').map(el => el.textContent)

      // Simulate scroll-out then scroll-in again
      vi.mocked(useInView).mockReturnValue(false)
      rerender(<TimelineSection />)
      vi.mocked(useInView).mockReturnValue(true)
      rerender(<TimelineSection />)

      act(() => { vi.advanceTimersByTime(15000) })

      screen.getAllByTestId('commit-hash').forEach((el, i) => {
        expect(el.textContent).toBe(completedHashes[i])
      })
    })
  })
})
