import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { SkillsSection } from './SkillsSection'

const motionMock = vi.hoisted(() => ({
  isInView: false,
  divProps: [] as Array<Record<string, unknown>>,
  useInView: vi.fn(),
}))

vi.mock('framer-motion', async () => {
  const React = await vi.importActual<typeof import('react')>('react')

  function getText(children: unknown): string {
    if (children == null || typeof children === 'boolean') {
      return ''
    }

    if (typeof children === 'string' || typeof children === 'number') {
      return String(children)
    }

    if (Array.isArray(children)) {
      return children.map(getText).join('')
    }

    if (React.isValidElement(children)) {
      const element = children as ReactElement<{ children?: unknown }>
      return getText(element.props.children)
    }

    return ''
  }

  function createMotionComponent(tagName: 'div' | 'section') {
    return React.forwardRef<HTMLElement, Record<string, unknown>>(function MockMotionComponent(props, ref) {
      const {
        animate,
        children,
        custom,
        initial,
        transition,
        variants,
        whileHover,
        ...domProps
      } = props

      if (tagName === 'div') {
        motionMock.divProps.push({
          animate,
          custom,
          initial,
          text: getText(children),
          transition,
          variants,
          whileHover,
          'data-testid': domProps['data-testid'],
        })
      }

      return React.createElement(tagName, { ...domProps, ref }, children as ReactNode)
    })
  }

  return {
    motion: {
      div: createMotionComponent('div'),
      section: createMotionComponent('section'),
    },
    useInView: motionMock.useInView.mockImplementation(() => motionMock.isInView),
  }
})

function getSkillTile(name: string) {
  const tile = screen.getByText(name).closest('.bi')
  expect(tile).not.toBeNull()
  return tile!
}

function getSkillAnimation(name: string) {
  const animation = motionMock.divProps.find(props => String(props.text).includes(name))
  expect(animation).toBeDefined()
  return animation!
}

function getGridAnimation() {
  const animations = motionMock.divProps.filter(props => props['data-testid'] === 'skills-grid')
  const animation = animations[animations.length - 1]
  expect(animation).toBeDefined()
  return animation!
}

function getLatestTileRevealOrder() {
  return motionMock.divProps
    .filter(props => props.text !== undefined && props.text !== '')
    .slice(-12)
    .map(props => [props.text, props.custom])
}

describe('SkillsSection', () => {
  beforeEach(() => {
    motionMock.isInView = false
    motionMock.divProps = []
    motionMock.useInView.mockClear()
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

    expect(getSkillAnimation('Python').custom).toBeLessThan(getSkillAnimation('Docker').custom as number)
    expect(getSkillAnimation('PyTorch').custom).toBeLessThan(getSkillAnimation('Git').custom as number)
  })

  it('assigns every skill tile one deterministic reveal position across renders', () => {
    const { unmount } = render(<SkillsSection />)

    const firstOrder = motionMock.divProps
      .filter(props => props.text !== undefined && props.text !== '')
      .map(props => [props.text, props.custom])

    unmount()
    motionMock.divProps = []

    render(<SkillsSection />)

    const secondOrder = motionMock.divProps
      .filter(props => props.text !== undefined && props.text !== '')
      .map(props => [props.text, props.custom])

    expect(new Set(firstOrder.map(([, order]) => order)).size).toBe(12)
    expect(firstOrder).toEqual(secondOrder)
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

  it('tiles animate from hidden opacity and scale to visible opacity and scale', () => {
    render(<SkillsSection />)

    const tileAnimations = motionMock.divProps.filter(props => props.text !== undefined && props.text !== '')

    expect(tileAnimations).toHaveLength(12)

    for (const tileAnimation of tileAnimations) {
      const variants = tileAnimation.variants as {
        hidden: unknown
        visible: (order: number) => unknown
      }

      expect(variants).toMatchObject({
        hidden: { opacity: 0, scale: 0.95 },
      })
      expect(variants.visible(tileAnimation.custom as number)).toMatchObject({
        opacity: 1,
        scale: 1,
        transition: { delay: (tileAnimation.custom as number) * 0.12, duration: 0.5, ease: 'easeOut' },
      })
      expect(tileAnimation.initial).toBeUndefined()
      expect(tileAnimation.whileHover).toBe('hover')
    }
  })

  it('grid switches to visible on viewport entry while tiles handle their own reveal delays', () => {
    motionMock.isInView = true

    render(<SkillsSection />)

    const gridAnimation = getGridAnimation()

    expect(gridAnimation).toMatchObject({
      animate: 'visible',
      initial: 'hidden',
      variants: {
        hidden: {},
        visible: {},
      },
    })
    expect(motionMock.useInView).toHaveBeenCalledWith(
      expect.objectContaining({ current: expect.any(HTMLElement) }),
      { margin: '-10% 0px -10% 0px' },
    )
  })

  it('keeps tile animation hidden until the skills grid enters the viewport', () => {
    render(<SkillsSection />)

    const gridAnimation = getGridAnimation()

    expect(gridAnimation).toMatchObject({
      animate: 'hidden',
      initial: 'hidden',
    })
  })

  it('resets to hidden after leaving the viewport and replays the deterministic order on re-entry', () => {
    motionMock.isInView = true
    const { rerender } = render(<SkillsSection />)

    const firstRevealOrder = getLatestTileRevealOrder()
    expect(getGridAnimation()).toMatchObject({ animate: 'visible' })

    motionMock.isInView = false
    rerender(<SkillsSection />)

    expect(getGridAnimation()).toMatchObject({ animate: 'hidden' })

    motionMock.isInView = true
    rerender(<SkillsSection />)

    expect(getGridAnimation()).toMatchObject({ animate: 'visible' })
    expect(getLatestTileRevealOrder()).toEqual(firstRevealOrder)
  })
})
