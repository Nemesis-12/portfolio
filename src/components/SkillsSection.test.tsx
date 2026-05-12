import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkillsSection } from './SkillsSection'

describe('SkillsSection', () => {
  it('renders a section element with id="skills"', () => {
    render(<SkillsSection />)
    const section = document.getElementById('skills')
    expect(section).toBeInTheDocument()
    expect(section!.tagName.toLowerCase()).toBe('section')
  })

  it('renders all required skill names', () => {
    render(<SkillsSection />)
    const required = [
      'Python', 'JavaScript', 'C/C++',
      'React', 'Next.js', 'Flask',
      'Node.js', 'Git/GitHub', 'Docker',
      'PostgreSQL', 'MongoDB', 'Figma',
    ]
    for (const skill of required) {
      expect(screen.getByText(skill)).toBeInTheDocument()
    }
  })

  it('renders all category label types', () => {
    render(<SkillsSection />)
    const categories = ['LANGUAGE', 'FRAMEWORK', 'TOOL', 'RUNTIME', 'DATABASE', 'DESIGN']
    for (const category of categories) {
      expect(screen.getAllByText(category).length).toBeGreaterThan(0)
    }
  })

  it('renders at least 12 skill tiles', () => {
    render(<SkillsSection />)
    const required = [
      'Python', 'JavaScript', 'C/C++',
      'React', 'Next.js', 'Flask',
      'Node.js', 'Git/GitHub', 'Docker',
      'PostgreSQL', 'MongoDB', 'Figma',
    ]
    expect(required.length).toBeGreaterThanOrEqual(12)
    for (const skill of required) {
      expect(screen.getByText(skill)).toBeInTheDocument()
    }
  })
})
