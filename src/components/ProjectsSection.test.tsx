import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectsSection from './ProjectsSection'

// Mock project data
const mockProjects = [
  {
    id: '1',
    title: 'Project One',
    description: 'Description for project one',
    tags: ['React', 'TypeScript'],
    image: '/image1.jpg'
  },
  {
    id: '2',
    title: 'Project Two',
    description: 'Description for project two',
    tags: ['Node.js', 'Express'],
    image: '/image2.jpg'
  }
]

describe('ProjectsSection', () => {
  it('renders all projects collapsed by default', () => {
    render(<ProjectsSection projects={mockProjects} />)

    // Check that project titles are present
    expect(screen.getByText('Project One')).toBeInTheDocument()
    expect(screen.getByText('Project Two')).toBeInTheDocument()

    // Check that descriptions are not visible (collapsed)
    expect(screen.queryByText('Description for project one')).not.toBeInTheDocument()
    expect(screen.queryByText('Description for project two')).not.toBeInTheDocument()

    // Check that image placeholder is not visible
    expect(screen.queryByText('// PROJECT IMAGE')).not.toBeInTheDocument()
  })

  it('expands a project when clicked', () => {
    render(<ProjectsSection projects={mockProjects} />)

    // Click the first project header
    const projectOneHeader = screen.getByText('Project One')
    fireEvent.click(projectOneHeader)

    // Now the description and image placeholder should be visible
    expect(screen.getByText('Description for project one')).toBeInTheDocument()
    expect(screen.getByText('// PROJECT IMAGE')).toBeInTheDocument()

    // The second project should still be collapsed
    expect(screen.queryByText('Description for project two')).not.toBeInTheDocument()
  })

  it('collapses an already expanded project when clicked again', () => {
    render(<ProjectsSection projects={mockProjects} />)
    
    // Expand first project
    const projectOneHeader = screen.getByText('Project One')
    fireEvent.click(projectOneHeader)
    expect(screen.getByText('Description for project one')).toBeInTheDocument()
    
    // Click again to collapse
    fireEvent.click(projectOneHeader)
    expect(screen.queryByText('Description for project one')).not.toBeInTheDocument()
  })

  it('expanding a second project collapses the first', () => {
    render(<ProjectsSection projects={mockProjects} />)
    
    // Expand first project
    const projectOneHeader = screen.getByText('Project One')
    fireEvent.click(projectOneHeader)
    expect(screen.getByText('Description for project one')).toBeInTheDocument()
    
    // Expand second project
    const projectTwoHeader = screen.getByText('Project Two')
    fireEvent.click(projectTwoHeader)
    
    // First project should now be collapsed
    expect(screen.queryByText('Description for project one')).not.toBeInTheDocument()
    // Second project should be expanded
    expect(screen.getByText('Description for project two')).toBeInTheDocument()
  })

  it('renders project rows matching the entries in projects data', () => {
    render(<ProjectsSection projects={mockProjects} />)
    
    // Check that we have two project rows (we'll assume each project is a row)
    const projectHeaders = screen.getAllByRole('heading', { level: 3 }) // Assuming h3 for project titles
    expect(projectHeaders).toHaveLength(2)
    expect(projectHeaders.map(h => h.textContent)).toContain('Project One')
    expect(projectHeaders.map(h => h.textContent)).toContain('Project Two')
    
    // Check that tags are rendered
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('Express')).toBeInTheDocument()
  })
})
