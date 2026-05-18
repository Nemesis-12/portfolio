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
        initial,
        transition,
        variants,
        whileHover,
        ...domProps
      } = props

      if (tagName === 'div') {
        motionMock.divProps.push({
          animate,
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

  it('desktop grid has an explicit grid-rows class with varied row heights', () => {
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

  it('grid defines at least 10 explicit rows to accommodate all skill tiles', () => {
    render(<SkillsSection />)
    const heights = getExplicitGridRows()
    expect(heights.length).toBeGreaterThanOrEqual(10)
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

  it('grid stays within the max-w-7xl section container', () => {
    render(<SkillsSection />)
    const grid = screen.getByTestId('skills-grid')

    expect(grid.parentElement).not.toBeNull()
    expect(grid.parentElement!.classList).toContain('max-w-7xl')
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
      expect(tileAnimation.variants).toMatchObject({
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.4, ease: 'easeOut' },
        },
      })
      expect(tileAnimation.initial).toBeUndefined()
      expect(tileAnimation.whileHover).toBe('hover')
    }
  })

  it('grid staggers tile animation and switches to visible on viewport entry once', () => {
    motionMock.isInView = true

    render(<SkillsSection />)

    const gridAnimation = motionMock.divProps.find(props => props.text === '')

    expect(gridAnimation).toMatchObject({
      animate: 'visible',
      initial: 'hidden',
      variants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
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
