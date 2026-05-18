import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

const sections = ['home', 'projects', 'skills', 'timeline', 'contact'] as const

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

  it('sections span full browser width (no max-width constraint)', () => {
    render(<App />)
    const sectionIds = document.querySelectorAll('section[id]')
    sectionIds.forEach((section) => {
      const style = window.getComputedStyle(section)
      expect(style.maxWidth).toBe('none')
    })
  })

  it('main element has no centered shell constraint', () => {
    render(<App />)
    const main = document.querySelector('main')
    expect(main).toBeInTheDocument()
    const style = window.getComputedStyle(main as Element)
    expect(style.display).toBe('block')
  })

  it('sections use full-viewport min-height for card-deck stacking', () => {
    render(<App />)
    const sectionIds = document.querySelectorAll('section[id]')
    sectionIds.forEach((section) => {
      expect(section.className).toContain('min-h-screen')
    })
  })
})
