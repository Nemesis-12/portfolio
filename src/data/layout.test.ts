import { describe, expect, it } from 'vitest'
import { NAV_HEIGHT } from './layout'

describe('layout tokens', () => {
  it('exports navbar height matching portfolio.css nav chrome', () => {
    expect(NAV_HEIGHT).toBe(56)
  })
})
