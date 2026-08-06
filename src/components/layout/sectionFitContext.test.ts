import { describe, expect, it } from 'vitest'
import { createFitClaimant } from './sectionFitContext'

describe('createFitClaimant', () => {
  it('lets the first caller claim it', () => {
    const claimant = createFitClaimant()
    expect(claimant.claimFit()).toBe(true)
  })

  it('refuses a second claim while the first is still held', () => {
    const claimant = createFitClaimant()
    claimant.claimFit()
    expect(claimant.claimFit()).toBe(false)
  })

  it('lets a new claimant succeed after release', () => {
    const claimant = createFitClaimant()
    claimant.claimFit()
    claimant.releaseFit()
    expect(claimant.claimFit()).toBe(true)
  })

  it('tolerates a release that was never preceded by a successful claim', () => {
    const claimant = createFitClaimant()
    expect(() => claimant.releaseFit()).not.toThrow()
    expect(claimant.claimFit()).toBe(true)
  })

  it('keeps claims from separate instances independent', () => {
    const a = createFitClaimant()
    const b = createFitClaimant()
    expect(a.claimFit()).toBe(true)
    expect(b.claimFit()).toBe(true)
  })
})
