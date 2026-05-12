import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

const sections = ['hero', 'projects', 'skills', 'timeline', 'contact'] as const

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
})
