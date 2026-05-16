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
      'Python', 'TypeScript', 'JavaScript', 'C / C++', 'SQL',
      'PyTorch', 'Hugging Face', 'Scikit-learn',
      'FastAPI',
      'Docker', 'Git', 'Ansible', 'Linux',
      'NumPy', 'Pandas',
    ]
    for (const skill of required) {
      expect(screen.getByText(skill)).toBeInTheDocument()
    }
  })

  it('renders all category label types', () => {
    render(<SkillsSection />)
    const categories = ['LANGUAGE', 'FRAMEWORK', 'TOOL', 'ML / DL', 'DATA']
    for (const category of categories) {
      expect(screen.getAllByText(category).length).toBeGreaterThan(0)
    }
  })

  it('renders 15 skill tiles (no decorative stripe row with 4 vertical divs)', () => {
    render(<SkillsSection />)

    const categoryLabels = screen.getAllByText(/^(LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA)$/)
    expect(categoryLabels).toHaveLength(15)

    const gridContainer = document.querySelector('.grid')
    const children = gridContainer?.children || []
    expect(children.length).toBe(16)
  })

  it('desktop grid has an explicit grid-rows class with at least 3 distinct row heights', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    const rowsClass = Array.from(grid.classList).find(c => c.includes('grid-rows-['))
    expect(rowsClass).toBeDefined()

    const match = rowsClass!.match(/grid-rows-\[(.+)\]/)
    expect(match).not.toBeNull()
    const heights = match![1].split('_')
    expect(new Set(heights).size).toBeGreaterThanOrEqual(3)
  })

  it('accent tile renders without category or skill name (colored fill only)', () => {
    render(<SkillsSection />)

    const gridContainer = document.querySelector('.grid')
    const children = Array.from(gridContainer?.children || [])
    const accentTile = children[children.length - 1]

    expect(accentTile).not.toHaveTextContent(/LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA/)
    expect(accentTile).not.toHaveTextContent(/Python|TypeScript|JavaScript|C \/ C\+\+|SQL/)

    const styles = window.getComputedStyle(accentTile)
    expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
