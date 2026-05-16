import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectsSection from './ProjectsSection'

const mockProjects = [
  {
    id: '1',
    title: 'Project One',
    description: 'Description for project one',
    tags: ['React', 'TypeScript'],
    links: [
      { label: 'GitHub', url: 'https://github.com/project1' },
      { label: 'Demo', url: 'https://demo.project1.com' }
    ],
    image: 'https://example.com/image1.png'
  },
  {
    id: '2',
    title: 'Project Two',
    description: 'Description for project two',
    tags: ['Node.js', 'Express'],
    links: [
      { label: 'Docs', url: 'https://docs.project2.com' }
    ]
  }
]

describe('ProjectsSection', () => {
  it('renders all projects as cards on initial render (no collapsed state)', () => {
    render(<ProjectsSection projects={mockProjects} />)

    expect(screen.getByText('Project One')).toBeInTheDocument()
    expect(screen.getByText('Project Two')).toBeInTheDocument()

    expect(screen.getByText('Description for project one')).toBeInTheDocument()
    expect(screen.getByText('Description for project two')).toBeInTheDocument()
  })

  it('displays title, description, tags, and links for each card', () => {
    render(<ProjectsSection projects={mockProjects} />)

    expect(screen.getByText('Project One')).toBeInTheDocument()
    expect(screen.getByText('Description for project one')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('// GitHub ↗')).toBeInTheDocument()
    expect(screen.getByText('// Demo ↗')).toBeInTheDocument()
  })

  it('renders image when provided', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(1)
    expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.png')
  })

  it('renders color placeholder when no image provided', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(1)

    expect(screen.queryByAltText('Project Two screenshot')).not.toBeInTheDocument()

    expect(screen.getByTestId('project-2-placeholder')).toBeInTheDocument()
  })

  it('placeholder uses vivid palette color, not a dark shade', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const placeholder = screen.getByTestId('project-2-placeholder')
    expect(placeholder).toHaveStyle({ backgroundColor: '#5200E0' })
  })

  it('renders project cards matching the entries in projects data', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(2)
    expect(headings.map(h => h.textContent)).toContain('Project One')
    expect(headings.map(h => h.textContent)).toContain('Project Two')

    expect(screen.getByText('// Docs ↗')).toBeInTheDocument()
  })
})