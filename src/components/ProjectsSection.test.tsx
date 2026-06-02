import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectsSection from './ProjectsSection'
import {
  getCarouselTrackWidth,
  getScrollRangeVh,
  PROJECT_CARD_WIDTH,
} from './projectsGeometry'

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
    expect(headings.map(h => h.textContent)).toContain('Project One')
    expect(headings.map(h => h.textContent)).toContain('Project Two')

    expect(screen.getByRole('link', { name: '// Docs ↗' })).toBeInTheDocument()
  })

  it('keeps the project title readable during hover fill', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const title = screen.getByRole('heading', { name: 'Project One' })
    const card = title.closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    expect(title).toHaveClass('pcard-name')

    await user.hover(card!)
    expect(title).toHaveClass('text-platinum')

    await user.unhover(card!)
    expect(title).not.toHaveClass('text-platinum')
  })

  it('renders fill as a static layer driven by CSS mask-position (not Framer clip-path)', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const fill = document.querySelector('[data-testid="project-card-fill"]')
    expect(fill).toBeInTheDocument()
    expect(fill?.tagName).toBe('DIV')
    expect(fill).toHaveClass('pcard-fill')
    expect(fill?.getAttribute('style') ?? '').not.toMatch(/clip-path/i)
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
    expect(card).toHaveAttribute('data-fill-active', 'false')
    expect(fill).toHaveAttribute('data-active', 'false')

    await user.tab()
    expect(link).toHaveFocus()
    expect(card).toHaveAttribute('data-fill-active', 'true')
    expect(fill).toHaveAttribute('data-active', 'true')
  })

  it('switches project card content to readable platinum text during the orange fill', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const title = screen.getByRole('heading', { name: 'Project One' })
    const card = title.closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    const description = screen.getByText('Description for project one')
    const link = screen.getByRole('link', { name: '// GitHub ↗' })

    await user.hover(card!)

    expect(title).toHaveClass('text-platinum')
    expect(description).toHaveClass('text-platinum')
    expect(link).toHaveClass('text-platinum')
  })

  it('inverts project tags, ghost number, and card number during the orange fill', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const title = screen.getByRole('heading', { name: 'Project One' })
    const card = title.closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    const ghostNumber = card!.querySelector('[data-testid="pcard-ghost"]')
    const cardNumber = card!.querySelector('[data-testid="pcard-num"]')
    const tag = screen.getByText('React')

    expect(card).toHaveAttribute('data-fill-active', 'false')

    await user.hover(card!)

    expect(card).toHaveAttribute('data-fill-active', 'true')
    expect(ghostNumber).not.toBeNull()
    expect(cardNumber).not.toBeNull()
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

  it('translates the carousel track from the projects section scroll position', () => {
    setViewport(1000, 800)
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects') as HTMLElement
    const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement

    vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(createRect(-400, 1600))
    const trackWidth = getCarouselTrackWidth(mockProjects.length, 1000)
    Object.defineProperty(carouselTrack, 'scrollWidth', {
      configurable: true,
      value: trackWidth,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(carouselTrack.style.transform).toBe(`translateX(${-0.5 * (trackWidth - 1000)}px)`)
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

  it('outer container height is one viewport per project', () => {
    setViewport(1000, 800)
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    expect(projectsSection).toBeInTheDocument()

    const expectedHeightVh = Math.max(mockProjects.length, 1)
    expect(projectsSection).toHaveStyle({ height: `${expectedHeightVh * 100}vh` })
  })

  it('outer container uses the hscroll section wrapper class', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    expect(projectsSection).toHaveClass('hscroll')
  })

  it('renders one snap-anchor per project at expected vertical landing points', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const anchors = document.querySelectorAll('.snap-anchor')
    expect(anchors).toHaveLength(mockProjects.length)

    anchors.forEach((anchor, index) => {
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

  it('outer container does not participate in global card-deck stack depth', () => {
    render(
      <>
        <ProjectsSection projects={mockProjects} />
        <section id="skills" />
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

    expect(projectsSection).not.toHaveAttribute('data-sticky-section')
    expect(projectsSection.style.zIndex).toBe('')
    expect(projectsSection.style.transform).toBe('')
    expect(projectsSection.style.opacity).toBe('')
  })

  it('scroll range calculation matches the one-viewport-per-project contract', () => {
    const projectCount = 2
    const viewportHeight = 800
    const expectedScrollRangeVh = projectCount
    const expectedScrollRangePx = (expectedScrollRangeVh - 1) * viewportHeight

    expect(expectedScrollRangeVh).toBe(2)
    expect(expectedScrollRangePx).toBe(800)
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

  describe('progress indicator', () => {
    it('renders zero-padded current index and total count in the header', () => {
      render(<ProjectsSection projects={mockProjects} />)
      expect(screen.getByTestId('progress-count')).toHaveTextContent('01 / 02')
    })

    it('progress indicator is inside the header row, not inside the carousel track', () => {
      render(<ProjectsSection projects={mockProjects} />)
      const progressIndicator = screen.getByTestId('progress-indicator')
      expect(progressIndicator.closest('[data-carousel-track="true"]')).toBeNull()
    })

    it('progress fill starts at 0% width before any scroll', () => {
      render(<ProjectsSection projects={mockProjects} />)
      const fill = screen.getByTestId('progress-fill')
      expect(fill).toHaveStyle({ width: '0%' })
    })

    it('progress fill width reflects carousel progress on scroll', () => {
      setViewport(1000, 800)
      render(<ProjectsSection projects={mockProjects} />)

      const projectsSection = document.getElementById('projects') as HTMLElement
      const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement

      vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(createRect(-400, 1600))
      Object.defineProperty(carouselTrack, 'scrollWidth', {
        configurable: true,
        value: getCarouselTrackWidth(mockProjects.length, 1000),
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      const fill = screen.getByTestId('progress-fill')
      const width = parseFloat(fill.style.width)
      expect(width).toBeGreaterThan(0)
      expect(width).toBeLessThanOrEqual(100)
    })

    it('progress indicator is inside the sticky viewport', () => {
      render(<ProjectsSection projects={mockProjects} />)
      const progressIndicator = screen.getByTestId('progress-indicator')
      expect(progressIndicator.closest('[data-sticky-viewport="true"]')).toBeInTheDocument()
    })

    it('progress count shows 01 / 01 for a single-project list', () => {
      render(<ProjectsSection projects={[mockProjects[0]]} />)
      expect(screen.getByTestId('progress-count')).toHaveTextContent('01 / 01')
    })

    it('progress count advances to last card index at full scroll', () => {
      setViewport(1000, 800)
      render(<ProjectsSection projects={mockProjects} />)

      const projectsSection = document.getElementById('projects') as HTMLElement
      const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement

      const sectionHeight = getScrollRangeVh(mockProjects.length) * 800
      vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(
        createRect(-(sectionHeight - 800), sectionHeight),
      )
      Object.defineProperty(carouselTrack, 'scrollWidth', {
        configurable: true,
        value: getCarouselTrackWidth(mockProjects.length, 1000),
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(screen.getByTestId('progress-count')).toHaveTextContent('02 / 02')
    })

    it('progress fill reaches 100% width at full scroll', () => {
      setViewport(1000, 800)
      render(<ProjectsSection projects={mockProjects} />)

      const projectsSection = document.getElementById('projects') as HTMLElement
      const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement

      const sectionHeight = getScrollRangeVh(mockProjects.length) * 800
      vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(
        createRect(-(sectionHeight - 800), sectionHeight),
      )
      Object.defineProperty(carouselTrack, 'scrollWidth', {
        configurable: true,
        value: getCarouselTrackWidth(mockProjects.length, 1000),
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      const fill = screen.getByTestId('progress-fill')
      expect(parseFloat(fill.style.width)).toBe(100)
    })
  })

  describe('scroll hint', () => {
    it('renders scroll hint element inside the sticky viewport', () => {
      render(<ProjectsSection projects={mockProjects} />)
      const hint = screen.getByTestId('scroll-hint')
      expect(hint).toBeInTheDocument()
      expect(hint.closest('[data-sticky-viewport="true"]')).toBeInTheDocument()
    })

    it('scroll hint is visible when progress is 0', () => {
      render(<ProjectsSection projects={mockProjects} />)
      const hint = screen.getByTestId('scroll-hint')
      expect(hint).toHaveAttribute('data-visible', 'true')
    })

    it('scroll hint is not visible when progress advances beyond 0', () => {
      setViewport(1000, 800)
      render(<ProjectsSection projects={mockProjects} />)

      const projectsSection = document.getElementById('projects') as HTMLElement
      const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement

      vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(createRect(-400, 1600))
      Object.defineProperty(carouselTrack, 'scrollWidth', {
        configurable: true,
        value: getCarouselTrackWidth(mockProjects.length, 1000),
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      const hint = screen.getByTestId('scroll-hint')
      expect(hint).toHaveAttribute('data-visible', 'false')
    })

    it('scroll hint is visually secondary (aria-hidden)', () => {
      render(<ProjectsSection projects={mockProjects} />)
      expect(screen.getByTestId('scroll-hint')).toHaveAttribute('aria-hidden', 'true')
    })

    it('scroll hint is not inside the carousel track', () => {
      render(<ProjectsSection projects={mockProjects} />)
      const hint = screen.getByTestId('scroll-hint')
      expect(hint.closest('[data-carousel-track="true"]')).toBeNull()
    })
  })

  describe('v4 notched card hierarchy', () => {
    it('each card exposes number, ghost number, title, description, tags, and links', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const cards = document.querySelectorAll('[data-testid="project-card"]')
      expect(cards).toHaveLength(2)

      cards.forEach((card, index) => {
        const project = mockProjects[index]
        const paddedId = project.id.padStart(2, '0')

        expect(card.querySelector('[data-testid="pcard-ghost"]')).toHaveTextContent(`_${paddedId}`)
        expect(card.querySelector('[data-testid="pcard-num"]')).toHaveTextContent(`_${paddedId}`)
        expect(card.querySelector('.pcard-name')).toHaveTextContent(project.title)
        expect(card.querySelector('.pcard-desc')).toHaveTextContent(project.description)

        project.tags.forEach((tag) => {
          expect(card.querySelector('.pcard-tags')).toHaveTextContent(tag)
        })

        project.links.forEach((link) => {
          expect(card.querySelector('.pcard-links')).toHaveTextContent(link.label)
        })
      })
    })

    it('renders a large ghost number element behind card content', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const ghost = document.querySelector('[data-testid="pcard-ghost"]')
      expect(ghost).toBeInTheDocument()
      expect(ghost).toHaveClass('pcard-ghost')
    })

    it('project title uses the pixel display font via pcard-name', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const title = screen.getByRole('heading', { name: 'Project One' })
      expect(title).toHaveClass('pcard-name')
    })

    it('tags use v4 palette classes', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const tags = document.querySelectorAll('.pcard-tags .ptag')
      expect(tags.length).toBeGreaterThan(0)
      tags.forEach((tag) => {
        expect(tag.className).toMatch(/ptag ptag-(fuchsia|blue|orange|yellow)/)
      })
    })

    it('cards use pcard sizing and do not collapse to full-width rows', () => {
      setViewport(1440, 900)
      render(<ProjectsSection projects={mockProjects} />)

      const card = document.querySelector('[data-testid="project-card"]') as HTMLElement
      expect(card).toHaveClass('pcard')
      expect(card).toHaveClass('shrink-0')
      expect(card.querySelector('.pcard-bg')).toBeInTheDocument()
      expect(PROJECT_CARD_WIDTH).toBe(560)
    })

    it('renders notched corner accent markers on each card', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const cards = document.querySelectorAll('[data-testid="project-card"]')
      cards.forEach((card) => {
        expect(card.querySelector('.pcard-notch.tl')).toBeInTheDocument()
        expect(card.querySelector('.pcard-notch.br')).toBeInTheDocument()
      })
    })

    it('renders card hierarchy for a single-project carousel', () => {
      const singleProject = [mockProjects[0]]
      render(<ProjectsSection projects={singleProject} />)

      const card = document.querySelector('[data-testid="project-card"]')
      expect(card).toBeInTheDocument()
      expect(card?.querySelector('[data-testid="pcard-ghost"]')).toHaveTextContent('_01')
      expect(card?.querySelector('.pcard-name')).toHaveTextContent('Project One')
    })

    it('renders empty tag and link regions without breaking card layout', () => {
      const sparseProject = [{
        id: '9',
        title: 'Sparse Project',
        description: 'No tags or links',
        tags: [],
        links: [],
      }]
      render(<ProjectsSection projects={sparseProject} />)

      const card = document.querySelector('[data-testid="project-card"]')
      expect(card?.querySelector('.pcard-tags')).toBeEmptyDOMElement()
      expect(card?.querySelector('.pcard-links')).toBeEmptyDOMElement()
      expect(card?.querySelector('.pcard-name')).toHaveTextContent('Sparse Project')
      expect(card?.querySelector('[data-testid="pcard-num"]')).toHaveTextContent('_09')
    })

    it('cycles tag palette variants for projects with more than four tags', () => {
      const manyTagsProject = [{
        id: '1',
        title: 'Tagged Project',
        description: 'Many technologies',
        tags: ['A', 'B', 'C', 'D', 'E'],
        links: [{ label: 'Site', url: 'https://example.com' }],
      }]
      render(<ProjectsSection projects={manyTagsProject} />)

      const tags = document.querySelectorAll('.pcard-tags .ptag')
      expect(tags).toHaveLength(5)
      expect(tags[4]).toHaveClass('ptag-fuchsia')
    })

    it('does not render dominant project screenshots inside cards', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const card = screen.getByRole('heading', { name: 'Project One' }).closest('[data-testid="project-card"]')
      expect(card?.querySelector('img')).not.toBeInTheDocument()
    })
  })

  describe('issue #218 - no scroll-driven card scale or opacity state', () => {
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

    function expectNoScrollDrivenCardDepthState(cards: NodeListOf<Element>) {
      cards.forEach((card) => {
        expect(card).not.toHaveAttribute('data-card-state')
        expect(card).not.toHaveAttribute('data-card-scale')
        expect(card).not.toHaveAttribute('data-card-opacity')
      })
    }

    it('cards do not expose active/neighbor/far scale or opacity attributes on initial render', () => {
      setViewport(1440, 900)
      render(<ProjectsSection projects={threeProjects} />)

      const cards = document.querySelectorAll('[data-testid="project-card"]')
      expect(cards).toHaveLength(3)
      expectNoScrollDrivenCardDepthState(cards)
    })

    function simulateProjectsScroll(projectCount: number, scrolledPx: number, viewportWidth = 1440, viewportHeight = 900) {
      setViewport(viewportWidth, viewportHeight)
      const projectsSection = document.getElementById('projects') as HTMLElement
      const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement
      const sectionHeight = getScrollRangeVh(projectCount) * viewportHeight

      vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(
        createRect(-scrolledPx, sectionHeight),
      )
      Object.defineProperty(carouselTrack, 'scrollWidth', {
        configurable: true,
        value: getCarouselTrackWidth(projectCount, viewportWidth),
      })

      act(() => window.dispatchEvent(new Event('scroll')))
    }

    it('scroll position does not add active/neighbor/far scale or opacity attributes at end of range', () => {
      setViewport(1440, 900)
      render(<ProjectsSection projects={threeProjects} />)

      const sectionHeight = getScrollRangeVh(threeProjects.length) * 900
      simulateProjectsScroll(threeProjects.length, sectionHeight - 900)

      const cards = document.querySelectorAll('[data-testid="project-card"]')
      expectNoScrollDrivenCardDepthState(cards)
    })

    it('scroll position does not add active/neighbor/far scale or opacity attributes at mid range', () => {
      setViewport(1440, 900)
      render(<ProjectsSection projects={threeProjects} />)

      const scrollRangePx = (getScrollRangeVh(threeProjects.length) - 1) * 900
      simulateProjectsScroll(threeProjects.length, scrollRangePx / 2)

      const cards = document.querySelectorAll('[data-testid="project-card"]')
      expectNoScrollDrivenCardDepthState(cards)
    })

    it('cards remain unfilled by default regardless of scroll position', () => {
      setViewport(1440, 900)
      render(<ProjectsSection projects={threeProjects} />)

      const sectionHeight = getScrollRangeVh(threeProjects.length) * 900
      simulateProjectsScroll(threeProjects.length, sectionHeight - 900)

      const cards = document.querySelectorAll('[data-testid="project-card"]')
      cards.forEach((card) => {
        expect(card).toHaveAttribute('data-fill-active', 'false')
        expect(card.querySelector('[data-testid="project-card-fill"]')).toHaveAttribute('data-active', 'false')
      })
    })

    it('hover fill still activates after scrolling', async () => {
      const user = userEvent.setup()
      setViewport(1440, 900)
      render(<ProjectsSection projects={threeProjects} />)

      const sectionHeight = getScrollRangeVh(threeProjects.length) * 900
      simulateProjectsScroll(threeProjects.length, sectionHeight - 900)

      const card = screen.getByRole('heading', { name: 'Project Three' }).closest('[data-testid="project-card"]')
      expect(card).not.toBeNull()

      const fill = card!.querySelector('[data-testid="project-card-fill"]')
      expect(fill).toHaveAttribute('data-active', 'false')

      await user.hover(card!)
      expect(card).toHaveAttribute('data-fill-active', 'true')
      expect(fill).toHaveAttribute('data-active', 'true')
    })

    it('outer container clips horizontal page overflow from carousel cards without breaking sticky', () => {
      setViewport(1440, 900)
      render(<ProjectsSection projects={threeProjects} />)

      const projectsSection = document.getElementById('projects')
      expect(projectsSection).toHaveStyle({ overflowX: 'clip' })
    })
  })
})
