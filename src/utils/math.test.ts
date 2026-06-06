import { describe, expect, it } from 'vitest'
import { clamp01 } from './math'

describe('clamp01', () => {
  it('returns 0 for negative values', () => {
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(-10)).toBe(0)
  })

  it('returns 1 for values above 1', () => {
    expect(clamp01(1.5)).toBe(1)
    expect(clamp01(10)).toBe(1)
  })

  it('passes through values between 0 and 1', () => {
    expect(clamp01(0)).toBe(0)
    expect(clamp01(0.5)).toBe(0.5)
    expect(clamp01(1)).toBe(1)
  })
})
