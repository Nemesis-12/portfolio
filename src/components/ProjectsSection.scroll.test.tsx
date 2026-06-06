import { describe, it, expect, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import ProjectsSection from './ProjectsSection'
import { getCarouselTrackWidth, getScrollRangeVh } from './projectsGeometry'
import { createRect, mockProjects, setViewport } from './ProjectsSection.test.shared'

describe('ProjectsSection scroll', () => {
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

  it('uses the Projects runway instead of raw section height for progress math', () => {
    const fourProjects = [
      ...mockProjects,
      {
        id: '3',
        title: 'Project Three',
        description: 'Description for project three',
        tags: ['Vue', 'Python'],
        links: [{ label: 'Site', url: 'https://project3.com' }],
      },
      {
        id: '4',
        title: 'Project Four',
        description: 'Description for project four',
        tags: ['Go', 'Postgres'],
        links: [{ label: 'Repo', url: 'https://github.com/project4' }],
      },
    ]

    setViewport(1200, 900)
    render(<ProjectsSection projects={fourProjects} />)

    const projectsSection = document.getElementById('projects') as HTMLElement
    const carouselTrack = document.querySelector('[data-carousel-track="true"]') as HTMLElement

    vi.spyOn(projectsSection, 'getBoundingClientRect').mockReturnValue(createRect(-1350, 9999))
    Object.defineProperty(carouselTrack, 'scrollWidth', {
      configurable: true,
      value: 3200,
    })

    act(() => window.dispatchEvent(new Event('scroll')))

    expect(carouselTrack.style.transform).toBe('translateX(-1000px)')
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '50%' })
  })

  it('outer container height is one viewport per project', () => {
    setViewport(1000, 800)
    render(<ProjectsSection projects={mockProjects} />)

    const projectsSection = document.getElementById('projects')
    expect(projectsSection).toBeInTheDocument()

    const expectedHeightVh = Math.max(mockProjects.length, 1)
    expect(projectsSection).toHaveStyle({ height: `${expectedHeightVh * 100}vh` })
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
        links: [{ label: 'Site', url: 'https://project3.com' }],
      },
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

    it('progress count shows 00 / 00 for an empty project list', () => {
      render(<ProjectsSection projects={[]} />)
      expect(screen.getByTestId('progress-count')).toHaveTextContent('00 / 00')
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
})
