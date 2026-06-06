import { describe, expect, it } from 'vitest'
import { projects } from './projects'
import { timelineEntries, type TimelineEntry } from './timeline'
import { FIRST_NAME, LAST_NAME } from '../components/HeroSection.constants'

// Resume source-of-truth constants (from public/resume.pdf)
const RESUME_FULL_NAME = 'Farhan Mohammed'
const RESUME_EMAIL = 'famohammed@shockers.wichita.edu'

const RESUME_TIMELINE = {
  netapp: {
    institution: 'NetApp Inc.',
    role: 'Software Engineer in Test',
    dateRange: 'Aug 2024 – Present',
    category: 'experience' as const,
  },
  ms: {
    institution: 'Wichita State University',
    role: 'Accelerated M.S. Computer Science',
    dateRange: 'Jan 2026 – Dec 2027 (Expected)',
    category: 'education' as const,
  },
  bs: {
    institution: 'Wichita State University',
    role: 'B.S. Computer Science',
    dateRange: 'Jan 2022 – Dec 2025',
    category: 'education' as const,
  },
}

/** Normalizes labels for factual comparison across resume PDF and site data. */
function normalizeResumeText(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function findEntry(predicate: (entry: TimelineEntry) => boolean): TimelineEntry {
  const entry = timelineEntries.find(predicate)
  if (!entry) {
    throw new Error('Expected timeline entry not found')
  }
  return entry
}

describe('resume source-of-truth audit', () => {
  describe('name', () => {
    it('hero name matches resume full name', () => {
      const displayName = `${FIRST_NAME} ${LAST_NAME}`
      expect(normalizeResumeText(displayName)).toBe(normalizeResumeText(RESUME_FULL_NAME))
    })
  })

  describe('contact', () => {
    it('site email matches resume', () => {
      expect(RESUME_EMAIL).toBe('famohammed@shockers.wichita.edu')
    })
  })

  describe('projects', () => {
    it('project count matches resume (2 projects)', () => {
      expect(projects).toHaveLength(2)
    })

    it('Leviathan tags match resume', () => {
      const leviathan = projects.find((p) => p.title === 'LEVIATHAN')
      expect(leviathan?.tags).toEqual([
        'PyTorch',
        'FastAPI',
        'Next.js',
        'TypeScript',
        'Tailwind CSS',
      ])
    })

    it('Leviathan bullets match resume', () => {
      const leviathan = projects.find((p) => p.title === 'LEVIATHAN')
      expect(leviathan?.bullets).toHaveLength(4)
      expect(leviathan?.bullets?.[0]).toContain('20M-parameter transformer')
      expect(leviathan?.bullets?.[1]).toContain('KV-cache memory')
      expect(leviathan?.bullets?.[2]).toContain('custom tokenizer')
      expect(leviathan?.bullets?.[3]).toContain('3M+ chess positions')
    })

    it('MLA_IMPL links match resume (GitHub + PyPI)', () => {
      const mlaImpl = projects.find((p) => p.title === 'MLA_IMPL')
      expect(mlaImpl?.links).toHaveLength(2)
      expect(mlaImpl?.links?.some((l) => l.label === 'GitHub')).toBe(true)
      expect(mlaImpl?.links?.some((l) => l.label === 'PyPI')).toBe(true)
    })

    it('MLA_IMPL bullets match resume', () => {
      const mlaImpl = projects.find((p) => p.title === 'MLA_IMPL')
      expect(mlaImpl?.bullets).toHaveLength(2)
      expect(mlaImpl?.bullets?.[0]).toContain('DeepSeek-V2')
      expect(mlaImpl?.bullets?.[1]).toContain('PyPI')
    })
  })

  describe('timeline', () => {
    it('entry count matches resume (1 experience + 2 education)', () => {
      expect(timelineEntries).toHaveLength(3)
      expect(timelineEntries.filter((e) => e.category === 'experience')).toHaveLength(1)
      expect(timelineEntries.filter((e) => e.category === 'education')).toHaveLength(2)
    })

    it('NetApp institution matches resume', () => {
      const netapp = findEntry((e) => e.category === 'experience')
      expect(normalizeResumeText(netapp.institution)).toBe(
        normalizeResumeText(RESUME_TIMELINE.netapp.institution),
      )
    })

    it('NetApp role matches resume', () => {
      const netapp = findEntry((e) => e.category === 'experience')
      expect(normalizeResumeText(netapp.role)).toBe(normalizeResumeText(RESUME_TIMELINE.netapp.role))
    })

    it('NetApp date range matches resume', () => {
      const netapp = findEntry((e) => e.category === 'experience')
      expect(normalizeResumeText(netapp.dateRange)).toBe(
        normalizeResumeText(RESUME_TIMELINE.netapp.dateRange),
      )
    })

    it('NetApp bullets match resume content', () => {
      const netapp = findEntry((e) => e.category === 'experience')
      expect(netapp.bullets).toHaveLength(4)
      expect(netapp.bullets[0]).toContain('automated analysis pipeline')
      expect(netapp.bullets[1]).toContain('30%')
    })

    it('M.S. institution matches resume', () => {
      const ms = findEntry(
        (e) =>
          e.category === 'education' &&
          normalizeResumeText(e.role).includes('accelerated ms computer science'),
      )
      expect(normalizeResumeText(ms.institution)).toBe(
        normalizeResumeText(RESUME_TIMELINE.ms.institution),
      )
    })

    it('M.S. role matches resume', () => {
      const ms = findEntry(
        (e) =>
          e.category === 'education' &&
          normalizeResumeText(e.role).includes('accelerated ms computer science'),
      )
      expect(normalizeResumeText(ms.role)).toBe(normalizeResumeText(RESUME_TIMELINE.ms.role))
    })

    it('M.S. date range matches resume', () => {
      const ms = findEntry(
        (e) =>
          e.category === 'education' &&
          normalizeResumeText(e.role).includes('accelerated ms computer science'),
      )
      expect(normalizeResumeText(ms.dateRange)).toBe(normalizeResumeText(RESUME_TIMELINE.ms.dateRange))
    })

    it('B.S. institution matches resume', () => {
      const bs = findEntry(
        (e) =>
          e.category === 'education' &&
          normalizeResumeText(e.role).includes('bs computer science'),
      )
      expect(normalizeResumeText(bs.institution)).toBe(
        normalizeResumeText(RESUME_TIMELINE.bs.institution),
      )
    })

    it('B.S. role matches resume', () => {
      const bs = findEntry(
        (e) =>
          e.category === 'education' &&
          normalizeResumeText(e.role).includes('bs computer science'),
      )
      expect(normalizeResumeText(bs.role)).toBe(normalizeResumeText(RESUME_TIMELINE.bs.role))
    })

    it('B.S. date range matches resume', () => {
      const bs = findEntry(
        (e) =>
          e.category === 'education' &&
          normalizeResumeText(e.role).includes('bs computer science'),
      )
      expect(normalizeResumeText(bs.dateRange)).toBe(normalizeResumeText(RESUME_TIMELINE.bs.dateRange))
    })

    it('B.S. education bullets match resume', () => {
      const bs = findEntry(
        (e) =>
          e.category === 'education' &&
          normalizeResumeText(e.role).includes('bs computer science'),
      )
      expect(bs.bullets[0]).toContain("Dean's List")
      expect(bs.bullets[1]).toContain('Relevant Coursework')
    })
  })
})
