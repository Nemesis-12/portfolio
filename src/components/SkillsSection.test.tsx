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

function getExplicitGridRows() {
  const grid = screen.getByTestId('skills-grid')
  const rowsClass = Array.from(grid.classList).find(className => className.includes('grid-rows-['))
  expect(rowsClass).toBeDefined()

  const match = rowsClass!.match(/grid-rows-\[(.+)\]/)
  expect(match).not.toBeNull()

  return match![1].split('_')
}

function getSkillTile(name: string) {
  const tile = screen.getByText(name).closest('div')
  expect(tile).not.toBeNull()
  return tile!
}

function getSkillAnimation(name: string) {
  const animation = motionMock.divProps.find(props => String(props.text).includes(name))
  expect(animation).toBeDefined()
  return animation!
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

  it('renders all required skill names', () => {
    render(<SkillsSection />)
    const required = [
      'Python', 'TypeScript', 'JavaScript', 'C / C++', 'SQL',
      'PyTorch', 'Hugging Face', 'Scikit-learn',
      'FastAPI',
      'Docker', 'Git', 'Ansible', 'Linux',
      'NumPy', 'Pandas',
      'Transformers', 'Attention Mechanisms', 'Gradient Optimization', 'Model Training / Fine-tuning',
      'Matplotlib', 'Mixed-Precision Training',
      'Jupyter',
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

  it('renders 22 skill tiles (15 original + 7 new from resume)', () => {
    render(<SkillsSection />)

    const categoryLabels = screen.getAllByText(/^(LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA)$/)
    expect(categoryLabels).toHaveLength(22)

    const gridContainer = document.querySelector('.grid')
    const children = gridContainer?.children || []
    expect(children.length).toBe(22)
  })

  it('desktop grid uses 6-column bento layout (md:grid-cols-6)', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    expect(grid.classList).toContain('md:grid-cols-6')
  })

  it('mobile grid uses 2-column bento layout (grid-cols-2)', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    expect(grid.classList).toContain('grid-cols-2')
  })

  it('desktop grid has varied row heights creating asymmetric bento rhythm', () => {
    render(<SkillsSection />)
    const heights = getExplicitGridRows()
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

  it('anchor skills (Python, PyTorch) have visibly stronger layout weight with larger spans', () => {
    render(<SkillsSection />)
    
    // Python should be the largest tile (3 cols × 3 rows)
    const pythonTile = screen.getByText('Python').closest('div')
    expect(pythonTile).not.toBeNull()
    expect(pythonTile!.className).toContain('md:col-span-3')
    expect(pythonTile!.className).toContain('md:row-span-3')
    
    // PyTorch should be second largest (3 cols × 2 rows)
    const pytorchTile = screen.getByText('PyTorch').closest('div')
    expect(pytorchTile).not.toBeNull()
    expect(pytorchTile!.className).toContain('md:col-span-3')
    expect(pytorchTile!.className).toContain('md:row-span-2')
  })

  it('reveals larger anchor skill tiles before smaller supporting tiles', () => {
    render(<SkillsSection />)

    expect(getSkillAnimation('Python').custom).toBeLessThan(getSkillAnimation('Docker').custom as number)
    expect(getSkillAnimation('PyTorch').custom).toBeLessThan(getSkillAnimation('FastAPI').custom as number)
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

    expect(new Set(firstOrder.map(([, order]) => order)).size).toBe(22)
    expect(firstOrder).toEqual(secondOrder)
  })

  it('grid defines at least 11 explicit rows to accommodate all skill tiles', () => {
    render(<SkillsSection />)
    const heights = getExplicitGridRows()
    expect(heights.length).toBeGreaterThanOrEqual(11)
  })

  it('new resume skills keep an asymmetric desktop layout', () => {
    render(<SkillsSection />)

    expect(getSkillTile('Transformers').className).toContain('md:col-span-2')
    expect(getSkillTile('Attention Mechanisms').className).toContain('md:col-span-2')
    expect(getSkillTile('Gradient Optimization').className).toContain('md:col-span-2')
    expect(getSkillTile('Model Training / Fine-tuning').className).toContain('md:col-span-3')
    expect(getSkillTile('Matplotlib').className).not.toContain('md:col-span-2')
    expect(getSkillTile('Mixed-Precision Training').className).toContain('md:col-span-2')
    expect(getSkillTile('Jupyter').className).not.toContain('md:col-span-3')
  })

  it('grid container has min-h-screen or min-h-svh class', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')
    const hasMinHeight = grid.classList.contains('min-h-screen') || 
                         grid.classList.contains('min-h-svh')
    expect(hasMinHeight).toBe(true)
  })

  it('grid rows use fr units instead of fixed px values', () => {
    render(<SkillsSection />)
    const rows = getExplicitGridRows()

    expect(rows.every(row => /^(\d+|\d*\.\d+)fr$/.test(row))).toBe(true)
  })

  it('grid spans full-width section (no max-w constraint)', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')

    expect(grid.parentElement).not.toBeNull()
    expect(grid.parentElement!.classList).not.toContain('max-w-7xl')
    expect(grid.parentElement!.classList).toContain('w-full')
  })

  it('no accent tile renders at bottom of grid', () => {
    render(<SkillsSection />)

    const gridContainer = document.querySelector('.grid')
    const children = Array.from(gridContainer?.children || [])

    const lastChild = children[children.length - 1]
    expect(lastChild.textContent).toContain('Jupyter')
    expect(lastChild.textContent).not.toMatch(/^(LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA)$/)

    const allSkills = [
      'Python', 'TypeScript', 'JavaScript', 'C / C++', 'SQL',
      'PyTorch', 'Hugging Face', 'Scikit-learn',
      'FastAPI', 'Docker', 'Git', 'Ansible', 'Linux',
      'NumPy', 'Pandas',
      'Transformers', 'Attention Mechanisms', 'Gradient Optimization', 'Model Training / Fine-tuning',
      'Matplotlib', 'Mixed-Precision Training', 'Jupyter',
    ]

    const allHaveCategoryOrSkill = children.every(child => {
      const text = child.textContent || ''
      const isCategory = /^(LANGUAGE|FRAMEWORK|TOOL|ML \/ DL|DATA)$/.test(text)
      const isKnownSkill = allSkills.some(skill => text.includes(skill))
      return isCategory || isKnownSkill
    })
    expect(allHaveCategoryOrSkill).toBe(true)
  })

  it('tiles animate from hidden opacity and scale to visible opacity and scale', () => {
    render(<SkillsSection />)

    const tileAnimations = motionMock.divProps.filter(props => props.text !== undefined && props.text !== '')

    expect(tileAnimations).toHaveLength(22)

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

  it('grid switches to visible on viewport entry once while tiles handle their own reveal delays', () => {
    motionMock.isInView = true

    render(<SkillsSection />)

    const gridAnimation = motionMock.divProps.find(props => props.text === '')

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
      { once: true, margin: '-10% 0px -10% 0px' },
    )
  })

  it('keeps tile animation hidden until the skills grid enters the viewport', () => {
    render(<SkillsSection />)

    const gridAnimation = motionMock.divProps.find(props => props.text === '')

    expect(gridAnimation).toMatchObject({
      animate: 'hidden',
      initial: 'hidden',
    })
  })
})
