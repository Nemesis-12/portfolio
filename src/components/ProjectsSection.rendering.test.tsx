import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectsSection from './ProjectsSection'
import { mockProjects, setViewport } from './ProjectsSection.test.shared'

describe('ProjectsSection rendering', () => {
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
    expect(screen.getByRole('link', { name: '// GitHub ↗' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '// Demo ↗' })).toBeInTheDocument()
  })

  it('does not render project screenshots inside cards (text-led layout)', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const cards = document.querySelectorAll('[data-testid="project-card"]')
    cards.forEach((card) => {
      expect(card.querySelector('img')).not.toBeInTheDocument()
    })
  })

  it('omits image and placeholder elements when no image is provided', () => {
    render(<ProjectsSection projects={mockProjects} />)

    expect(screen.queryByAltText('Project Two screenshot')).not.toBeInTheDocument()
    expect(screen.queryByTestId('project-2-placeholder')).not.toBeInTheDocument()

    expect(screen.getByRole('heading', { name: 'Project Two' })).toBeInTheDocument()
    expect(screen.getByText('Description for project two')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('Express')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '// Docs ↗' })).toHaveAttribute('href', 'https://docs.project2.com')
  })

  it('renders project cards matching the entries in projects data', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(2)
    expect(headings.map((h) => h.textContent)).toContain('Project One')
    expect(headings.map((h) => h.textContent)).toContain('Project Two')

    expect(screen.getByRole('link', { name: '// Docs ↗' })).toBeInTheDocument()
  })

  it('renders proj-edge spacers before the first card and after the last card', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const edges = document.querySelectorAll('.proj-edge')
    expect(edges).toHaveLength(2)
    expect(edges[0]?.nextElementSibling).toHaveAttribute('data-testid', 'project-card')
    expect(edges[1]?.previousElementSibling).toHaveAttribute('data-testid', 'project-card')
  })

  it('renders cards in a horizontal track structure for carousel scrolling', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const carouselTrack = document.querySelector('[data-carousel-track="true"]')
    expect(carouselTrack).toBeInTheDocument()

    const cards = document.querySelectorAll('[data-testid="project-card"]')
    expect(cards).toHaveLength(2)
  })

  it('carousel track uses hscroll-track layout classes', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const carouselTrack = document.querySelector('[data-carousel-track="true"]')
    expect(carouselTrack).toBeInTheDocument()
    expect(carouselTrack).toHaveClass('hscroll-track')
    expect(carouselTrack).toHaveClass('proj-track')
  })

  it('section header uses hscroll classes with orange slash and pixel font name', () => {
    render(<ProjectsSection projects={mockProjects} />)

    expect(document.querySelector('.hscroll-head')).toBeInTheDocument()
    expect(document.querySelector('.hscroll-no')?.textContent).toBe('// 01')
    expect(document.querySelector('.hscroll-name')?.textContent).toBe('PROJECTS')
    expect(document.querySelector('.hscroll-rule')).toBeInTheDocument()
    expect(screen.getByTestId('progress-indicator')).toHaveClass('hscroll-progress')
    expect(screen.getByTestId('progress-fill')).toHaveClass('hscroll-progress-fill')
    expect(screen.getByTestId('progress-fill').parentElement).toHaveClass('hscroll-progress-track')
  })

  it('section header is separate from carousel track', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const headerLabel = screen.getByText('PROJECTS')
    const carouselTrack = document.querySelector('[data-carousel-track="true"]')

    expect(headerLabel.closest('[data-carousel-track="true"]')).toBeNull()
    expect(carouselTrack).toBeInTheDocument()
  })

  it('omits resume bullets from cards to preserve v4 content hierarchy', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const cards = document.querySelectorAll('[data-testid="project-card"]')
    cards.forEach((card) => {
      expect(card.querySelector('ul')).not.toBeInTheDocument()
    })
    expect(screen.queryByText('First bullet point for project one')).not.toBeInTheDocument()
  })

  it('outer container uses the hscroll section wrapper class', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    expect(projectsSection).toHaveClass('hscroll')
  })

  it('renders one snap-anchor per project at expected vertical landing points', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    const anchors = document.querySelectorAll('.snap-anchor')
    expect(anchors).toHaveLength(mockProjects.length)

    anchors.forEach((anchor, index) => {
      expect(anchor.parentElement).toBe(projectsSection)
      expect(anchor).toHaveStyle({ top: `${index * 100}vh` })
    })
  })

  it('renders a single snap anchor at 0vh for one project', () => {
    render(<ProjectsSection projects={[mockProjects[0]]} />)

    const anchors = screen.getAllByTestId('snap-anchor')
    expect(anchors).toHaveLength(1)
    expect(anchors[0]).toHaveStyle({ top: '0vh' })
  })

  it('sticky viewport child has 100vh height and top: 0', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    const stickyViewport = projectsSection?.querySelector('[data-sticky-viewport="true"]')
    expect(stickyViewport).toBeInTheDocument()
    expect(stickyViewport).toHaveClass('hscroll-sticky')
  })

  it('marks the outer projects wrapper as a card-deck scroll host', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    expect(projectsSection).toHaveAttribute('data-sticky-scroll-host', 'true')
  })

  it('section header is outside the carousel track and remains pinned', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const headerLabel = screen.getByText('PROJECTS')
    const carouselTrack = document.querySelector('[data-carousel-track="true"]')

    expect(headerLabel.closest('[data-carousel-track="true"]')).toBeNull()
    expect(carouselTrack).toBeInTheDocument()

    expect(headerLabel.closest('[data-sticky-viewport="true"]')).toBeInTheDocument()
    expect(carouselTrack?.closest('[data-sticky-viewport="true"]')).toBeInTheDocument()
  })

  it('restores the reference sticky viewport shell with direct header, track, and scroll hint children', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const stickyViewport = document.querySelector('[data-sticky-viewport="true"]')
    const header = document.querySelector('.hscroll-head')
    const carouselTrack = document.querySelector('[data-carousel-track="true"]')
    const scrollHint = screen.getByTestId('scroll-hint')

    expect(header?.parentElement).toBe(stickyViewport)
    expect(carouselTrack?.parentElement).toBe(stickyViewport)
    expect(scrollHint.parentElement).toBe(stickyViewport)
    expect(scrollHint).toHaveClass('hscroll-hint')
  })

  it('outer container clips horizontal overflow without creating a sticky-breaking scroll container', () => {
    setViewport(1000, 800)
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    expect(projectsSection).toHaveStyle({ overflowX: 'clip' })
  })
})
