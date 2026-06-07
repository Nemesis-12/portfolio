import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProjectsSection from './ProjectsSection'
import {
  getCarouselTrackWidth,
  getScrollRangeVh,
  PROJECT_CARD_WIDTH,
} from './projectsGeometry'
import { createRect, mockProjects, setViewport } from './ProjectsSection.test.shared'

describe('ProjectsSection cards', () => {
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

  it('renders fill as a static clipped opacity layer (not Framer clip-path)', () => {
    render(<ProjectsSection projects={mockProjects} />)

    const fill = document.querySelector('[data-testid="project-card-fill"]')
    expect(fill).toBeInTheDocument()
    expect(fill?.tagName).toBe('DIV')
    expect(fill).toHaveClass('pcard-fill')
    expect(fill?.getAttribute('style') ?? '').not.toMatch(/clip-path/i)
  })

  it('activates the orange fill layer when a project card is hovered', async () => {
    const user = userEvent.setup()
    render(<ProjectsSection projects={mockProjects} />)

    const card = screen.getByRole('heading', { name: 'Project One' }).closest('[data-testid="project-card"]')
    expect(card).not.toBeNull()

    const clip = card!.querySelector('.pcard-clip')
    const fill = card!.querySelector('[data-testid="project-card-fill"]')
    expect(clip).toHaveAttribute('aria-hidden', 'true')
    expect(fill).toBeInTheDocument()
    expect(fill).toHaveAttribute('data-active', 'false')

    await user.hover(card!)
    expect(fill).toHaveAttribute('data-active', 'true')

    await user.unhover(card!)
    expect(fill).toHaveAttribute('data-active', 'false')
  })

  it('activates the orange fill while a project card link has focus', async () => {
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

    await user.tab()
    await user.tab()
    expect(fill).toHaveAttribute('data-active', 'false')
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

    it('renders only the bottom-right notched corner accent on each card', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const cards = document.querySelectorAll('[data-testid="project-card"]')
      cards.forEach((card) => {
        expect(card.querySelector('.pcard-notch.tl')).not.toBeInTheDocument()
        expect(card.querySelector('.pcard-notch.br')).toBeInTheDocument()
      })
    })

    it('nests fill layer inside pcard-clip while the remaining notch stays outside', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const card = document.querySelector('[data-testid="project-card"]')
      expect(card).not.toBeNull()

      const clip = card!.querySelector('.pcard-clip')
      expect(clip).toBeInTheDocument()

      const bg = card!.querySelector('.pcard-bg')
      const fill = card!.querySelector('[data-testid="project-card-fill"]')
      expect(bg).toBeInTheDocument()
      expect(fill).toBeInTheDocument()
      expect(clip!.contains(bg)).toBe(true)
      expect(clip!.contains(fill)).toBe(true)

      const notches = card!.querySelectorAll('.pcard-notch')
      expect(notches).toHaveLength(1)
      notches.forEach((notch) => {
        expect(clip!.contains(notch)).toBe(false)
      })
    })

    it('does not render a left-edge rising highlight strip', () => {
      render(<ProjectsSection projects={mockProjects} />)

      const cards = document.querySelectorAll('[data-testid="project-card"]')
      const leftStripClasses = ['left-0', 'top-0', 'bottom-0', 'w-[3px]', 'bg-atomic-tangerine']

      cards.forEach((card) => {
        const leftStrip = Array.from(card.querySelectorAll('*')).find((element) =>
          leftStripClasses.every((className) => element.classList.contains(className)),
        )

        expect(leftStrip).toBeUndefined()
      })
    })

    it('toggles data-fill-active on card for opacity fill reveal', async () => {
      const user = userEvent.setup()
      render(<ProjectsSection projects={mockProjects} />)

      const card = screen.getByRole('heading', { name: 'Project One' }).closest('[data-testid="project-card"]')
      expect(card).not.toBeNull()

      const fill = card!.querySelector('[data-testid="project-card-fill"]')
      expect(card).toHaveAttribute('data-fill-active', 'false')

      await user.hover(card!)
      expect(card).toHaveAttribute('data-fill-active', 'true')
      expect(fill).toHaveAttribute('data-active', 'true')

      await user.unhover(card!)
      expect(card).toHaveAttribute('data-fill-active', 'false')
      expect(fill).toHaveAttribute('data-active', 'false')
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

  describe('issue #233 - no active/neighbor/far card suppression state', () => {
    const threeProjects = [
      ...mockProjects,
      {
        id: '3',
        title: 'Project Three',
        description: 'Description for project three',
        tags: ['Vue', 'Python'],
        links: [{ label: 'Site', url: 'https://project3.com' }],
      },
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

    function simulateProjectsScroll(
      projectCount: number,
      scrolledPx: number,
      viewportWidth = 1440,
      viewportHeight = 900,
    ) {
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
