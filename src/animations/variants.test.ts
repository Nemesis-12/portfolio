import { describe, it, expect } from 'vitest'
import { fadeUp, hoverEase } from './variants'

describe('fadeUp', () => {
  it('defines hidden and visible states for scroll-triggered entry', () => {
    expect(fadeUp.hidden.opacity).toBe(0)
    expect(fadeUp.hidden.y).toBeGreaterThan(0)
    expect(fadeUp.visible.opacity).toBe(1)
    expect(fadeUp.visible.y).toBe(0)
  })

  it('includes a transition on the visible state', () => {
    expect(fadeUp.visible).toHaveProperty('transition')
  })
})

describe('hoverEase', () => {
  it('defines idle and hover states for interactive elements', () => {
    expect(hoverEase.idle.scale).toBe(1)
    expect(hoverEase.hover.scale).toBe(1.05)
  })

  it('includes a transition on the hover state', () => {
    expect(hoverEase.hover).toHaveProperty('transition')
  })
})
