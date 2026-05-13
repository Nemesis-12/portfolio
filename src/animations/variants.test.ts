import { describe, it, expect } from 'vitest'
import { fadeUp, hoverEase } from './variants'

describe('fadeUp', () => {
  it('defines hidden and visible states for scroll-triggered entry', () => {
    expect(fadeUp).toHaveProperty('hidden')
    expect(fadeUp).toHaveProperty('visible')
    expect(fadeUp.hidden).toHaveProperty('opacity', 0)
    expect(fadeUp.hidden).toHaveProperty('y')
    expect(fadeUp.hidden.y).toBeGreaterThan(0)
    expect(fadeUp.visible).toHaveProperty('opacity', 1)
    expect(fadeUp.visible).toHaveProperty('y', 0)
  })

  it('includes a transition on the visible state', () => {
    expect(fadeUp.visible).toHaveProperty('transition')
  })
})

describe('hoverEase', () => {
  it('defines idle and hover states for interactive elements', () => {
    expect(hoverEase).toHaveProperty('idle')
    expect(hoverEase).toHaveProperty('hover')
    expect(hoverEase.idle.scale).toBe(1)
    expect(hoverEase.hover).toHaveProperty('scale')
    expect(hoverEase.hover.scale).toBe(1.05)
  })

  it('includes a transition on the hover state', () => {
    expect(hoverEase.hover).toHaveProperty('transition')
  })
})
