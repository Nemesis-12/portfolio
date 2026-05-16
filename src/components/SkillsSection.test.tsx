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

  it('renders 15 skill tiles with no accent tile', () => {
    render(<SkillsSection />)

    const categoryLabels = screen.getAllByText(/^(LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA)$/)
    expect(categoryLabels).toHaveLength(15)

    const gridContainer = document.querySelector('.grid')
    const children = gridContainer?.children || []
    expect(children.length).toBe(15)
  })

  it('desktop grid has an explicit grid-rows class with at least 3 distinct row heights', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    const rowsClass = Array.from(grid.classList).find(c => c.includes('grid-rows-['))
    expect(rowsClass).toBeDefined()

    const match = rowsClass!.match(/grid-rows-\[(.+)\]/)
    expect(match).not.toBeNull()
    const heights = match![1].split('_')
    expect(new Set(heights).size).toBeGreaterThanOrEqual(2)
  })

  it('at least two tiles cross the center column with md:col-span-3 on desktop', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    const tilesWithColSpan3 = Array.from(grid.children).filter(
      el => el.className.includes('md:col-span-3')
    )
    expect(tilesWithColSpan3.length).toBeGreaterThanOrEqual(2)
  })

  it('TypeScript tile spans 2 columns on desktop (md:col-span-2) to break repetitive right-side pattern', () => {
    render(<SkillsSection />)
    const tsTile = screen.getByText('TypeScript').closest('div')
    expect(tsTile).not.toBeNull()
    expect(tsTile!.className).toContain('md:col-span-2')
  })

  it('Python tile spans at least 3 rows on desktop (md:row-span-3 or higher)', () => {
    render(<SkillsSection />)
    const pythonTile = screen.getByText('Python').closest('div')
    expect(pythonTile).not.toBeNull()
    expect(pythonTile!.className).toMatch(/md:row-span-[3-9]/)
  })

  it('grid defines at least 8 explicit rows to accommodate Python row-span-3 layout', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    const rowsClass = Array.from(grid.classList).find(c => c.includes('grid-rows-['))
    expect(rowsClass).toBeDefined()
    const match = rowsClass!.match(/grid-rows-\[(.+)\]/)
    expect(match).not.toBeNull()
    const heights = match![1].split('_')
    expect(heights.length).toBeGreaterThanOrEqual(8)
  })

  it('no accent tile renders at bottom of grid', () => {
    render(<SkillsSection />)

    const gridContainer = document.querySelector('.grid')
    const children = Array.from(gridContainer?.children || [])

    expect(children.length).toBe(15)

    const lastChild = children[children.length - 1]
    expect(lastChild.textContent).toContain('SQL')
    expect(lastChild.textContent).not.toMatch(/^(LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA)$/)

    const allHaveCategoryOrSkill = children.every(child => {
      const text = child.textContent || ''
      return /^(LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA)$/.test(text) ||
             /Python|TypeScript|JavaScript|C \/ C\+\+|SQL|Docker|Git|Ansible|Linux|NumPy|Pandas|FastAPI|PyTorch|Hugging Face|Scikit-learn/.test(text)
    })
    expect(allHaveCategoryOrSkill).toBe(true)
  })
})
