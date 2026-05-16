import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import TimelineSection from './TimelineSection'

describe('TimelineSection', () => {
  it('each entry has min-h-screen', () => {
    render(<TimelineSection />)
    const commitEntries = document.querySelectorAll('[class*="font-mono"][class*="py-"]')
    expect(commitEntries.length).toBe(3)
    commitEntries.forEach(entry => {
      expect(entry).toHaveClass('min-h-screen')
    })
  })

  it('entries start empty (typewriter effect)', () => {
    render(<TimelineSection />)
    const entries = document.querySelectorAll('[class*="font-mono"][class*="min-h-screen"]')
    expect(entries.length).toBe(3)
    entries.forEach(entry => {
      const text = entry.textContent || ''
      expect(text.length).toBeLessThan(10)
    })
  })
})