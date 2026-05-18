import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

const sections = ['home', 'projects', 'skills', 'timeline', 'contact'] as const
const shellConstraintClasses = ['container', 'max-w-7xl', 'mx-auto'] as const

function expectNoShellConstraint(element: Element) {
  shellConstraintClasses.forEach((className) => {
    expect(element.classList).not.toContain(className)
  })
}

describe('App shell', () => {
  it.each(sections)('renders %s section', (id) => {
    render(<App />)
    const section = document.getElementById(id)
    expect(section).toBeInTheDocument()
    expect(section?.tagName.toLowerCase()).toBe('section')
  })

  it('renders sections in the correct order', () => {
    render(<App />)
    const sectionIds = document.querySelectorAll('section[id]')
    expect(Array.from(sectionIds).map((s) => s.id)).toEqual([...sections])
  })

  it('section surfaces span the full browser width', () => {
    render(<App />)
    const sectionIds = document.querySelectorAll('section[id]')
    sectionIds.forEach((section) => {
      expectNoShellConstraint(section)
      expect(section.className).toContain('min-h-screen')
    })
  })

  it('main element has no centered shell constraint', () => {
    render(<App />)
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
    expect(main).not.toHaveAttribute('class')
    expectNoShellConstraint(main as Element)
  })
})
