import { describe, expect, it } from 'vitest'
import { projects } from './projects'
import { FIRST_NAME, LAST_NAME } from '../components/HeroSection.constants'

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
})
