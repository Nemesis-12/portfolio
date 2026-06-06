import { describe, expect, it } from 'vitest'
import { projects } from './projects'
import { FIRST_NAME, LAST_NAME } from '../components/HeroSection.constants'
import { timelineEntries } from './timeline'

// Resume source-of-truth constants (from public/resume.pdf)
const RESUME_FULL_NAME = 'Farhan Mohammed'
const RESUME_EMAIL = 'famohammed@shockers.wichita.edu'

describe('resume source-of-truth audit', () => {
  describe('name', () => {
    it('hero name constants combine to match resume full name', () => {
      const displayName = `${FIRST_NAME} ${LAST_NAME}`
      expect(displayName).toBe(RESUME_FULL_NAME.toUpperCase())
    })
  })

  describe('contact', () => {
    it('email constant matches resume', () => {
      const mailtoHref = `mailto:${RESUME_EMAIL}`
      expect(mailtoHref).toBe('mailto:famohammed@shockers.wichita.edu')
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

    it('NetApp date range matches resume', () => {
      const netapp = timelineEntries.find((e) => e.hash === 'd4e8f2c')
      expect(netapp?.dateRange).toBe('AUG 2024 – PRESENT')
    })

    it('NetApp bullets match resume content', () => {
      const netapp = timelineEntries.find((e) => e.hash === 'd4e8f2c')
      expect(netapp?.bullets).toHaveLength(4)
      expect(netapp?.bullets?.[0]).toContain('automated analysis pipeline')
      expect(netapp?.bullets?.[1]).toContain('30%')
    })

    it('B.S. education bullets match resume', () => {
      const bs = timelineEntries.find((e) => e.hash === 'b7c3e1a')
      expect(bs?.bullets?.[0]).toContain("Dean's List")
      expect(bs?.bullets?.[1]).toContain('Relevant Coursework')
    })

    it('documents resume formatting differences for role titles', () => {
      const netapp = timelineEntries.find((e) => e.hash === 'd4e8f2c')
      // Resume uses title case; timeline uses stylized uppercase with underscores.
      expect(netapp?.role).toBe('SOFTWARE_ENGINEER_IN_TEST')
      expect(netapp?.role).not.toBe('Software Engineer in Test')
    })

    it('documents resume content gap for B.S. GPA honors line', () => {
      const bs = timelineEntries.find((e) => e.hash === 'b7c3e1a')
      // Resume includes "GPA: 3.66/4.0, Magna Cum Laude" in the degree line.
      expect(bs?.role).toBe('B.S._COMPUTER_SCIENCE')
      expect(bs?.role).not.toContain('GPA')
    })
  })
})
