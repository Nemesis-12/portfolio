import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { REVEAL_ORDER, SkillsSection, revealTransitionDelay } from './SkillsSection'

let observerCallback!: IntersectionObserverCallback
let observedElement: Element | undefined
let intersectionObserverOptions: IntersectionObserverInit | undefined

function stubIntersectionObserver() {
  vi.stubGlobal('IntersectionObserver', vi.fn(function (
    cb: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    observerCallback = cb
    intersectionObserverOptions = options
    return {
      observe: vi.fn((element: Element) => {
        observedElement = element
      }),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    }
  }))
}

function getSkillTile(name: string) {
  const tile = screen.getByText(name).closest('.bi')
  expect(tile).not.toBeNull()
  return tile as HTMLElement
}

function getTileTransitionDelay(name: string) {
  return getSkillTile(name).style.transitionDelay
}

function parseTransitionDelaySeconds(delay: string) {
  return Number.parseFloat(delay)
}

function getLatestSkillTileTransitionDelays() {
  const grid = screen.getByTestId('skills-grid')
  return Array.from(grid.querySelectorAll('.bi')).map((tile) => {
    const name = tile.querySelector('.bi-name')?.textContent ?? 'palette'
    return [name, (tile as HTMLElement).style.transitionDelay] as const
  })
}

function fireIntersection(isIntersecting: boolean) {
  act(() => {
    observerCallback(
      [{ target: observedElement!, isIntersecting } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
  })
}

describe('SkillsSection', () => {
  beforeEach(() => {
    observedElement = undefined
    intersectionObserverOptions = undefined
    stubIntersectionObserver()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders a section element with id="skills"', () => {
    render(<SkillsSection />)
    const section = document.getElementById('skills')
    expect(section).toBeInTheDocument()
    expect(section!.tagName.toLowerCase()).toBe('section')
  })

  it('renders bento skill tiles from the reference layout', () => {
    render(<SkillsSection />)
    const required = [
      'Python', 'TypeScript', 'JavaScript', 'C / C++',
      'Docker', 'Git',
      'NumPy', 'Pandas',
      'FastAPI', 'PyTorch', 'Hugging Face', 'Scikit-learn',
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

  it('grid container has class bento', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    expect(grid).toHaveClass('bento')
  })

  it('renders 12 skill tiles and 1 palette tile with bi class', () => {
    render(<SkillsSection />)

    const categoryLabels = screen.getAllByText(/^(LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA)$/)
    expect(categoryLabels).toHaveLength(12)

    const biTiles = document.querySelectorAll('.bi')
    expect(biTiles).toHaveLength(13)
  })

  it('section header uses hscroll classes with orange slash and pixel font name', () => {
    render(<SkillsSection />)

    expect(document.querySelector('.hscroll-head')).toBeInTheDocument()
    expect(document.querySelector('.hscroll-no')?.textContent).toBe('// 02')
    expect(document.querySelector('.hscroll-name')?.textContent).toBe('SKILLS')
    expect(document.querySelector('.hscroll-rule')).toBeInTheDocument()
  })

  it('each skill tile has bi, bi-{area}, and c-{color} classes', () => {
    render(<SkillsSection />)

    expect(getSkillTile('Python').className).toMatch(/\bbi\b/)
    expect(getSkillTile('Python').className).toContain('bi-py')
    expect(getSkillTile('Python').className).toContain('c-orange')
    expect(getSkillTile('Python').className).toContain('bi-lg')

    expect(getSkillTile('TypeScript').className).toContain('bi-js')
    expect(getSkillTile('TypeScript').className).toContain('c-blue')

    expect(getSkillTile('Docker').className).toContain('bi-dk')
    expect(getSkillTile('Docker').className).toContain('c-platinum')

    expect(getSkillTile('JavaScript').className).toContain('bi-re')
    expect(getSkillTile('C / C++').className).toContain('bi-cc')
    expect(getSkillTile('NumPy').className).toContain('bi-nd')
    expect(getSkillTile('FastAPI').className).toContain('bi-nx')
    expect(getSkillTile('PyTorch').className).toContain('bi-fl')
    expect(getSkillTile('Hugging Face').className).toContain('bi-gt')
    expect(getSkillTile('Scikit-learn').className).toContain('bi-pg')
    expect(getSkillTile('Pandas').className).toContain('bi-fg')
    expect(getSkillTile('Git').className).toContain('bi-mn')
  })

  it('uses bi-cat and bi-name hierarchy inside each tile', () => {
    render(<SkillsSection />)

    const pythonTile = getSkillTile('Python')
    expect(pythonTile.querySelector('.bi-cat')?.textContent).toBe('LANGUAGE')
    expect(pythonTile.querySelector('.bi-name')?.textContent).toBe('Python')
  })

  it('renders palette swatch tile in bottom-right grid area', () => {
    render(<SkillsSection />)

    const palette = screen.getByTestId('skills-palette')
    expect(palette).toHaveClass('bi')
    expect(palette).toHaveClass('bi-pal')
    expect(palette.querySelectorAll('.pswatch')).toHaveLength(4)
  })

  it('Python dominates top-left with bi-py and bi-lg', () => {
    render(<SkillsSection />)
    const pythonTile = getSkillTile('Python')
    expect(pythonTile.className).toContain('bi-py')
    expect(pythonTile.className).toContain('bi-lg')
  })

  it('reveals larger anchor skill tiles before smaller supporting tiles', () => {
    render(<SkillsSection />)

    expect(parseTransitionDelaySeconds(getTileTransitionDelay('Python')))
      .toBeLessThan(parseTransitionDelaySeconds(getTileTransitionDelay('Docker')))
    expect(parseTransitionDelaySeconds(getTileTransitionDelay('PyTorch')))
      .toBeLessThan(parseTransitionDelaySeconds(getTileTransitionDelay('Git')))
  })

  it('assigns every skill tile one deterministic reveal position across renders', () => {
    const { unmount } = render(<SkillsSection />)

    const firstOrder = getLatestSkillTileTransitionDelays()

    unmount()

    render(<SkillsSection />)

    const secondOrder = getLatestSkillTileTransitionDelays()

    expect(new Set(firstOrder.map(([, delay]) => delay)).size).toBe(13)
    expect(firstOrder).toEqual(secondOrder)
  })

  it('derives transitionDelay values from the static reveal-order array index', () => {
    render(<SkillsSection />)

    for (const [index, area] of REVEAL_ORDER.entries()) {
      expect(revealTransitionDelay(area)).toBe(`${index * 0.12}s`)
    }
  })

  it('skill tiles use sharp edges (no rounded corners)', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    const tiles = Array.from(grid.children)

    for (const tile of tiles) {
      expect(tile.className).not.toMatch(/rounded/)
    }
  })

  it('palette tile is the last grid child', () => {
    render(<SkillsSection />)

    const grid = screen.getByTestId('skills-grid')
    const children = Array.from(grid.children)
    expect(children[children.length - 1]).toHaveAttribute('data-testid', 'skills-palette')
  })

  it('keeps tiles hidden until the skills grid enters the viewport', () => {
    render(<SkillsSection />)

    for (const tile of document.querySelectorAll('.bi')) {
      expect(tile).not.toHaveClass('in')
    }
  })

  it('observes the skills grid with IntersectionObserver root margin', () => {
    render(<SkillsSection />)

    expect(observedElement).toBe(screen.getByTestId('skills-grid'))
    expect(intersectionObserverOptions).toEqual({ rootMargin: '-10% 0px -10% 0px' })
  })

  it('reveals tiles when the grid enters the viewport', () => {
    render(<SkillsSection />)

    fireIntersection(true)

    for (const tile of document.querySelectorAll('.bi')) {
      expect(tile).toHaveClass('in')
    }
  })

  it('resets to hidden after leaving the viewport and replays the deterministic order on re-entry', () => {
    render(<SkillsSection />)

    fireIntersection(true)

    const firstRevealOrder = getLatestSkillTileTransitionDelays()
    expect(document.querySelectorAll('.bi.in')).toHaveLength(13)

    fireIntersection(false)

    for (const tile of document.querySelectorAll('.bi')) {
      expect(tile).not.toHaveClass('in')
    }

    fireIntersection(true)

    expect(document.querySelectorAll('.bi.in')).toHaveLength(13)
    expect(getLatestSkillTileTransitionDelays()).toEqual(firstRevealOrder)
  })
})
