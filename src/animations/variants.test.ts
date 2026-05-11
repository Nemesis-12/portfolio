import { describe, it, expect } from 'vitest'
import { fadeUpVariant, hoverVariant } from './variants'

describe('fadeUpVariant', () => {
  it('defines hidden and visible states for scroll-triggered entry', () => {
    expect(fadeUpVariant).toHaveProperty('hidden')
    expect(fadeUpVariant).toHaveProperty('visible')
    expect(fadeUpVariant.hidden).toHaveProperty('opacity', 0)
    expect(fadeUpVariant.hidden).toHaveProperty('y')
    expect(typeof fadeUpVariant.hidden.y).toBe('number')
    expect(fadeUpVariant.hidden.y).toBeGreaterThan(0)
    expect(fadeUpVariant.visible).toHaveProperty('opacity', 1)
    expect(fadeUpVariant.visible).toHaveProperty('y', 0)
  })

  it('includes a transition on the visible state', () => {
    expect(fadeUpVariant.visible).toHaveProperty('transition')
  })
})

describe('hoverVariant', () => {
  it('defines idle and hover states for interactive elements', () => {
    expect(hoverVariant).toHaveProperty('idle')
    expect(hoverVariant).toHaveProperty('hover')
    expect(hoverVariant.hover).toHaveProperty('scale')
    expect(typeof hoverVariant.hover.scale).toBe('number')
  })

  it('includes a transition on the hover state', () => {
    expect(hoverVariant.hover).toHaveProperty('transition')
  })
})
