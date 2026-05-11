import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App shell', () => {
  it('renders all five section anchor IDs', () => {
    render(<App />)
    const sectionIds = ['hero', 'projects', 'skills', 'timeline', 'contact']
    for (const id of sectionIds) {
      const section = document.getElementById(id)
      expect(section).toBeInTheDocument()
      expect(section!.tagName.toLowerCase()).toBe('section')
    }
  })

  it('renders sections in the correct order', () => {
    render(<App />)
    const sections = document.querySelectorAll('section[id]')
    const ids = Array.from(sections).map((s) => s.id)
    expect(ids).toEqual(['hero', 'projects', 'skills', 'timeline', 'contact'])
  })
})
