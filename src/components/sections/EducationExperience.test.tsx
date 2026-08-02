import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EducationExperience } from './EducationExperience'
import { EDUCATION_COLUMN, EXPERIENCE_COLUMN } from '@/data/timeline'
import { getSectionMeta } from '@/data/sections'

/**
 * Smoke coverage for issue #320: this component is pure presentation over
 * `src/data/timeline.ts`, so these assertions only check the public-
 * interface shape a visitor and a screen reader actually see -- the
 * section landmark, every entry's status/date/title/qualifier/bullets,
 * and that current entries carry a distinguishable status label from
 * finished ones. Viewport-fit (side-by-side above 880px, single column
 * below it) cannot be verified in jsdom and is checked in a browser
 * instead.
 */
describe('EducationExperience', () => {
  it('renders the timeline section with its documented id, named by its own heading', () => {
    render(<EducationExperience />)

    const meta = getSectionMeta('path')
    const region = screen.getByRole('region', { name: meta.title })
    expect(region).toHaveAttribute('id', meta.id)
  })

  it('renders both column headings', () => {
    render(<EducationExperience />)

    expect(screen.getByText(EDUCATION_COLUMN.heading)).toBeInTheDocument()
    expect(screen.getByText(EXPERIENCE_COLUMN.heading)).toBeInTheDocument()
  })

  it('renders every entry with its status, date range, title, qualifier, and bullets', () => {
    render(<EducationExperience />)

    for (const column of [EDUCATION_COLUMN, EXPERIENCE_COLUMN]) {
      for (const entry of column.entries) {
        const heading = screen.getByRole('heading', { name: entry.title })
        const article = heading.closest('article')
        expect(article).not.toBeNull()
        const scoped = within(article as HTMLElement)

        expect(scoped.getByText(entry.statusLabel)).toBeInTheDocument()
        expect(scoped.getByText(entry.dateRange)).toBeInTheDocument()
        expect(scoped.getByText(entry.qualifier)).toBeInTheDocument()

        for (const bullet of entry.bullets) {
          expect(scoped.getByText(bullet)).toBeInTheDocument()
        }
        expect(entry.bullets.length).toBeGreaterThanOrEqual(2)
        expect(entry.bullets.length).toBeLessThanOrEqual(3)
      }
    }
  })

  it('gives current entries a distinct status label from finished entries', () => {
    render(<EducationExperience />)

    const currentEntries = [...EDUCATION_COLUMN.entries, ...EXPERIENCE_COLUMN.entries].filter(
      (entry) => entry.status === 'current',
    )
    const completeEntries = [...EDUCATION_COLUMN.entries, ...EXPERIENCE_COLUMN.entries].filter(
      (entry) => entry.status === 'complete',
    )

    expect(currentEntries.length).toBeGreaterThan(0)
    expect(completeEntries.length).toBeGreaterThan(0)

    const currentLabels = new Set(currentEntries.map((entry) => entry.statusLabel))
    const completeLabels = new Set(completeEntries.map((entry) => entry.statusLabel))
    for (const label of currentLabels) {
      expect(completeLabels.has(label)).toBe(false)
    }
  })
})
