import { describe, expect, it } from 'vitest'
import { countUpValue, easeOutCubic } from './countUp'

describe('easeOutCubic', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
  })

  it('clamps progress outside [0, 1]', () => {
    expect(easeOutCubic(-1)).toBe(0)
    expect(easeOutCubic(2)).toBe(1)
  })

  it('is monotonically non-decreasing', () => {
    let prev = easeOutCubic(0)
    for (let p = 0.1; p <= 1; p += 0.1) {
      const next = easeOutCubic(p)
      expect(next).toBeGreaterThanOrEqual(prev)
      prev = next
    }
  })

  it('front-loads progress (ease-out): more than half done by the midpoint', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })
})

describe('countUpValue', () => {
  it('is 0 at the start of the count', () => {
    expect(countUpValue(19, 0, 900)).toBe(0)
  })

  it('reaches the target once elapsed time meets the duration', () => {
    expect(countUpValue(19, 900, 900)).toBe(19)
  })

  it('clamps to the target past the duration, never overshooting', () => {
    expect(countUpValue(19, 5000, 900)).toBe(19)
  })

  it('treats a non-positive duration as already complete', () => {
    expect(countUpValue(20, 0, 0)).toBe(20)
    expect(countUpValue(20, 100, -50)).toBe(20)
  })

  it('is monotonically non-decreasing as elapsed time advances', () => {
    let prev = countUpValue(100, 0, 900)
    for (let elapsed = 50; elapsed <= 900; elapsed += 50) {
      const next = countUpValue(100, elapsed, 900)
      expect(next).toBeGreaterThanOrEqual(prev)
      prev = next
    }
  })

  it('always returns a whole number', () => {
    expect(Number.isInteger(countUpValue(19, 333, 900))).toBe(true)
  })
})
