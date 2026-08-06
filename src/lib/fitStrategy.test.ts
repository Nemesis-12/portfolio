import { describe, expect, it } from 'vitest'
import { isResidualOverflow, zoomFitStrategy } from './fitStrategy'

describe('zoomFitStrategy.nextCorrection', () => {
  it('proposes no correction once the section already fits (overflow <= 1px)', () => {
    expect(zoomFitStrategy.nextCorrection({ overflowPx: 1, elementHeightPx: 500, currentScale: 1 })).toBeNull()
    expect(zoomFitStrategy.nextCorrection({ overflowPx: 0, elementHeightPx: 500, currentScale: 1 })).toBeNull()
    expect(zoomFitStrategy.nextCorrection({ overflowPx: -20, elementHeightPx: 500, currentScale: 1 })).toBeNull()
  })

  it('proposes no correction when the element reports no height to measure against', () => {
    expect(zoomFitStrategy.nextCorrection({ overflowPx: 50, elementHeightPx: 0, currentScale: 1 })).toBeNull()
    expect(zoomFitStrategy.nextCorrection({ overflowPx: 50, elementHeightPx: -10, currentScale: 1 })).toBeNull()
  })

  it('shrinks proportionally to how much of the element the overflow represents', () => {
    // 100px of a 1000px-tall element overflowing -> keep 90% of the current scale.
    const correction = zoomFitStrategy.nextCorrection({ overflowPx: 100, elementHeightPx: 1000, currentScale: 1 })
    expect(correction).not.toBeNull()
    expect(correction?.scale).toBeCloseTo(0.9)
    expect(correction?.cssValue).toBe(String(correction?.scale))
  })

  it('compounds against a scale already applied from a previous pass', () => {
    const correction = zoomFitStrategy.nextCorrection({ overflowPx: 50, elementHeightPx: 500, currentScale: 0.7 })
    expect(correction?.scale).toBeCloseTo(0.7 * 0.9)
  })

  it('never proposes a scale below its own floor, however large the overflow', () => {
    const correction = zoomFitStrategy.nextCorrection({ overflowPx: 900, elementHeightPx: 1000, currentScale: 1 })
    expect(correction?.scale).toBe(zoomFitStrategy.floor)
  })

  it('never proposes a scale below its floor even compounding from an already-shrunk scale', () => {
    const correction = zoomFitStrategy.nextCorrection({ overflowPx: 900, elementHeightPx: 1000, currentScale: 0.65 })
    expect(correction?.scale).toBe(zoomFitStrategy.floor)
  })
})

describe('isResidualOverflow', () => {
  it('is false when the section fits (overflow at/under the 1px tolerance)', () => {
    expect(isResidualOverflow(1, zoomFitStrategy.floor, zoomFitStrategy)).toBe(false)
    expect(isResidualOverflow(0, zoomFitStrategy.floor, zoomFitStrategy)).toBe(false)
  })

  it('is false when real overflow remains but the floor has not been reached yet', () => {
    expect(isResidualOverflow(50, 0.9, zoomFitStrategy)).toBe(false)
  })

  it('is true once the floor is reached and the section still overflows', () => {
    expect(isResidualOverflow(50, zoomFitStrategy.floor, zoomFitStrategy)).toBe(true)
  })

  it('is true for a scale below the floor too (defensive: should never happen, but must not hide the case)', () => {
    expect(isResidualOverflow(50, zoomFitStrategy.floor - 0.1, zoomFitStrategy)).toBe(true)
  })
})
