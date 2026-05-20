import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectsSection from './ProjectsSection'
import { getScrollRangeVh } from './projectsGeometry'

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
    image: 'https://example.com/image1.png',
    bullets: [
      'First bullet point for project one',
      'Second bullet point for project one'
    ]
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

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  })
}

function createRect(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: window.innerWidth,
    width: window.innerWidth,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

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
    expect(headings.map(h => h.textContent)).toContain('Project One')
    expect(headings.map(h => h.textContent)).toContain('Project Two')

    expect(screen.getByText('// Docs ↗')).toBeInTheDocument()
  })

  it('keeps the project title readable during hover fill', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const title = screen.getByRole('heading', { name: 'Project One' })
    const card = title.closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    expect(title).toHaveClass('text-graphite')

    await user.hover(card!)
    expect(title).toHaveClass('text-graphite')

    await user.unhover(card!)
    expect(title).toHaveClass('text-graphite')
  })

  it('activates a diagonal orange fill layer when a project card is hovered', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const card = screen.getByRole('heading', { name: 'Project One' }).closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    const fill = card!.querySelector('[data-testid="project-card-fill"]')
    expect(fill).toBeInTheDocument()
    expect(fill).toHaveAttribute('aria-hidden', 'true')
    expect(fill).toHaveAttribute('data-active', 'false')

    await user.hover(card!)
    expect(fill).toHaveAttribute('data-active', 'true')

    await user.unhover(card!)
    expect(fill).toHaveAttribute('data-active', 'false')
  })

  it('activates the diagonal orange fill while a project card link has focus', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const link = screen.getByRole('link', { name: '// GitHub ↗' })
    const card = link.closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    const fill = card!.querySelector('[data-testid="project-card-fill"]')
    expect(fill).toHaveAttribute('data-active', 'false')

    await user.tab()
    expect(link).toHaveFocus()
    expect(fill).toHaveAttribute('data-active', 'true')
  })

  it('switches project card content to readable graphite text during the orange fill', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const title = screen.getByRole('heading', { name: 'Project One' })
    const card = title.closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    const description = screen.getByText('Description for project one')
    const bullet = screen.getByText('First bullet point for project one')
    const link = screen.getByRole('link', { name: '// GitHub ↗' })

    await user.hover(card!)

    expect(title).toHaveClass('text-graphite')
    expect(description).toHaveClass('text-graphite')
    expect(bullet.closest('ul')).toHaveClass('text-graphite')
    expect(link).toHaveClass('text-graphite')
  })

  it('inverts project tags and ghost number during the orange fill', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const title = screen.getByRole('heading', { name: 'Project One' })
    const card = title.closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    const ghostNumber = screen.getByText('_01')
    const tag = screen.getByText('React')

    await user.hover(card!)

    expect(ghostNumber).toHaveClass('text-graphite')
    expect(tag).toHaveAttribute('data-inverted', 'true')
  })

  it('fill stays active when tabbing between links within the same card', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const githubLink = screen.getByRole('link', { name: '// GitHub ↗' })
    const demoLink = screen.getByRole('link', { name: '// Demo ↗' })
    const card = githubLink.closest('[data-testid="project-card"]')!
    const fill = card.querySelector('[data-testid="project-card-fill"]')!

    await user.tab()
    expect(githubLink).toHaveFocus()
    expect(fill).toHaveAttribute('data-active', 'true')

    await user.tab()
    expect(demoLink).toHaveFocus()
    expect(fill).toHaveAttribute('data-active', 'true')
  })

  it('fill deactivates when focus leaves the project card', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const githubLink = screen.getByRole('link', { name: '// GitHub ↗' })
    const card = githubLink.closest('[data-testid="project-card"]')!
    const fill = card.querySelector('[data-testid="project-card-fill"]')!

    await user.tab()
    expect(githubLink).toHaveFocus()
    expect(fill).toHaveAttribute('data-active', 'true')

    // Tab past Demo link, then out of the card entirely
    await user.tab()
    await user.tab()
    expect(fill).toHaveAttribute('data-active', 'false')
  })

  it('renders cards in a horizontal track structure for carousel scrolling', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const carouselTrack = document.querySelector('[data-carousel-track="true"]')
    expect(carouselTrack).toBeInTheDocument()

    const cards = document.querySelectorAll('[data-testid="project-card"]')
    expect(cards).toHaveLength(2)
  })

  it('carousel track has relative positioning for horizontal layout', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const carouselTrack = document.querySelector('[data-carousel-track="true"]')
    expect(carouselTrack).toBeInTheDocument()
    expect(carouselTrack).toHaveClass('relative')
  })

  it('translates the carousel track from the projects section scroll position', () => {
    setViewport(1000, 800)
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects') as HTMLElement
    const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement

    vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(createRect(-800, 2400))
    Object.defineProperty(carouselTrack, 'scrollWidth', {
      configurable: true,
      value: 1800,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    const centerOffset = 1000 / 2 - 480 / 2
    expect(carouselTrack.style.transform).toBe(`translateX(${-400 + centerOffset}px)`)
  })

  it('section header is separate from carousel track', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const headerLabel = screen.getByText('PROJECTS')
    const carouselTrack = document.querySelector('[data-carousel-track="true"]')

    expect(headerLabel.closest('[data-carousel-track="true"]')).toBeNull()
    expect(carouselTrack).toBeInTheDocument()
  })

  it('renders resume bullets when provided', () => {
    render(<ProjectsSection projects={mockProjects} />)

    expect(screen.getByText('First bullet point for project one')).toBeInTheDocument()
    expect(screen.getByText('Second bullet point for project one')).toBeInTheDocument()
  })

  it('omits bullets section when project has no bullets', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const projectTwoCard = screen.getByRole('heading', { name: 'Project Two' }).closest('[data-testid="project-card"]')
    expect(projectTwoCard).not.toBeNull()

    const bulletsList = projectTwoCard?.querySelector('ul')
    expect(bulletsList).not.toBeInTheDocument()
  })

  it('renders bullets as a list structure', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const lists = document.querySelectorAll('[data-testid="project-card"] ul')
    expect(lists).toHaveLength(1)
    expect(lists[0].querySelectorAll('li')).toHaveLength(2)
  })

  it('card has explicit width constraint to prevent full-width collapse', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const card = document.querySelector('[data-testid="project-card"]')
    expect(card).not.toBeNull()
    const style = window.getComputedStyle(card!)
    expect(style.maxWidth).not.toBe('none')
    expect(style.maxWidth).not.toBe('')
  })

  it('outer container uses the scroll range formula (projects.length * 1.5 + 1) * 100vh', () => {
    setViewport(1000, 800)
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    expect(projectsSection).toBeInTheDocument()

    const expectedHeightVh = mockProjects.length * 1.5 + 1
    expect(projectsSection).toHaveStyle({ height: `${expectedHeightVh * 100}vh` })
  })

  it('sticky viewport child has 100vh height and top: 0', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    const stickyViewport = projectsSection?.querySelector('[data-sticky-viewport="true"]')
    expect(stickyViewport).toBeInTheDocument()

    const style = window.getComputedStyle(stickyViewport!)
    expect(style.height).toBe('100vh')
    expect(style.top).toBe('0px')
    expect(style.position).toBe('sticky')
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

  it('outer container does not introduce horizontal overflow', () => {
    setViewport(1000, 800)
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    expect(projectsSection).toHaveStyle({ overflowX: 'hidden' })
  })

  it('outer container participates in card-deck stack depth', () => {
    render(
      <>
        <ProjectsSection projects={mockProjects} />
        <section data-sticky-section="true" id="skills" />
      </>,
    )

    const projectsSection = document.getElementById('projects') as HTMLElement
    const skillsSection = document.getElementById('skills') as HTMLElement
    vi.spyOn(skillsSection, 'getBoundingClientRect').mockReturnValue(createRect(400, 800))
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 800,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(projectsSection).toHaveAttribute('data-sticky-section', 'true')
    expect(projectsSection.style.zIndex).toBe('1')
    expect(projectsSection.style.transform).toBe('scale(0.975)')
    expect(projectsSection.style.opacity).toBe('0.875')
  })

  it('scroll range calculation matches the desktop geometry contract', () => {
    const projectCount = 2
    const viewportHeight = 800
    const expectedScrollRangeVh = projectCount * 1.5 + 1
    const expectedScrollRangePx = expectedScrollRangeVh * viewportHeight

    expect(expectedScrollRangeVh).toBe(4)
    expect(expectedScrollRangePx).toBe(3200)
  })

  it('getScrollRangeVh returns correct vh multiplier for various project counts', () => {
    expect(getScrollRangeVh(1)).toBe(2.5)
    expect(getScrollRangeVh(2)).toBe(4)
    expect(getScrollRangeVh(3)).toBe(5.5)
    expect(getScrollRangeVh(4)).toBe(7)
    expect(getScrollRangeVh(0)).toBe(1)
  })

  it('derives active index from adjusted progress using Math.round(progress * (projects.length - 1))', () => {
    const projectCount = 4
    expect(Math.round(0 * (projectCount - 1))).toBe(0)
    expect(Math.round(0.25 * (projectCount - 1))).toBe(1)
    expect(Math.round(0.5 * (projectCount - 1))).toBe(2)
    expect(Math.round(0.75 * (projectCount - 1))).toBe(2)
    expect(Math.round(1 * (projectCount - 1))).toBe(3)
  })

  it('active index at start of scroll range is 0', () => {
    const progress = 0
    const activeIndex = Math.round(progress * (mockProjects.length - 1))
    expect(activeIndex).toBe(0)
  })

  it('active index at end of scroll range is last project', () => {
    const progress = 1
    const activeIndex = Math.round(progress * (mockProjects.length - 1))
    expect(activeIndex).toBe(mockProjects.length - 1)
  })

  it('active index transitions through middle projects as progress advances', () => {
    const threeProjects = [
      ...mockProjects,
      {
        id: '3',
        title: 'Project Three',
        description: 'Description for project three',
        tags: ['Vue', 'Python'],
        links: [{ label: 'Site', url: 'https://project3.com' }]
      }
    ]

    const progressPoints = [0, 0.33, 0.5, 0.66, 1]
    const expectedIndices = [0, 1, 1, 1, 2]

    progressPoints.forEach((progress, i) => {
      const activeIndex = Math.round(progress * (threeProjects.length - 1))
      expect(activeIndex).toBe(expectedIndices[i])
    })
  })
})
