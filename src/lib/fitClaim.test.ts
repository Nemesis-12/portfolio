import { describe, expect, it } from 'vitest'
import { createFitClaim } from './fitClaim'

describe('createFitClaim', () => {
  it('starts unheld', () => {
    expect(createFitClaim().isHeld).toBe(false)
  })

  it('lets the first caller claim it', () => {
    const claim = createFitClaim()
    expect(claim.claim()).toBe(true)
    expect(claim.isHeld).toBe(true)
  })

  it('refuses a second claim while the first is still held', () => {
    const claim = createFitClaim()
    claim.claim()
    expect(claim.claim()).toBe(false)
    expect(claim.isHeld).toBe(true)
  })

  it('lets a new claimant succeed after release', () => {
    const claim = createFitClaim()
    claim.claim()
    claim.release()
    expect(claim.isHeld).toBe(false)
    expect(claim.claim()).toBe(true)
  })

  it('tolerates a release that was never preceded by a successful claim', () => {
    const claim = createFitClaim()
    expect(() => claim.release()).not.toThrow()
    expect(claim.isHeld).toBe(false)
  })

  it('keeps claims from separate instances independent', () => {
    const a = createFitClaim()
    const b = createFitClaim()
    expect(a.claim()).toBe(true)
    expect(b.claim()).toBe(true)
  })
})
