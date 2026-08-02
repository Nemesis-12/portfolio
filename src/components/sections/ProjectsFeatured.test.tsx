import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectsFeatured } from './ProjectsFeatured'
import { LEVIATHAN_HOOK, LEVIATHAN_LINKS, LEVIATHAN_STATS } from '@/data/leviathan'
import { getSectionMeta } from '@/data/sections'

/**
 * Smoke coverage for issue #317: this component is pure presentation over
 * `src/data/leviathan.ts`, so the real correctness weight sits in
 * `src/lib/leviathan/pipeline.test.ts` and `countUp.test.ts` instead.
 * These assertions only check the public-interface shape a visitor and a
 * screen reader actually see: the section landmark, the one-line hook, the
 * three stats by their accessible names, and the two links resolving to
 * the right URLs.
 */
describe('ProjectsFeatured', () => {
  it('renders the featured-project section with its documented id, named by its own heading', () => {
    render(<ProjectsFeatured />)

    const meta = getSectionMeta('projects')
    const region = screen.getByRole('region', { name: 'Leviathan' })
    expect(region).toHaveAttribute('id', meta.id)
  })

  it('states the one-line hook before any supporting detail', () => {
    render(<ProjectsFeatured />)

    expect(screen.getByText(LEVIATHAN_HOOK)).toBeInTheDocument()
  })

  it('presents all three headline stats by their full accessible figures', () => {
    render(<ProjectsFeatured />)

    for (const stat of LEVIATHAN_STATS) {
      expect(screen.getByRole('group', { name: stat.accessibleName })).toBeInTheDocument()
    }
  })

  it('links to the source and the live demo with the correct URLs', () => {
    render(<ProjectsFeatured />)

    for (const link of LEVIATHAN_LINKS) {
      const anchor = screen.getByRole('link', { name: new RegExp(link.label, 'i') })
      expect(anchor).toHaveAttribute('href', link.href)
      expect(anchor).toHaveAttribute('target', '_blank')
    }
  })

  it('renders the animated inference-pipeline panel', () => {
    render(<ProjectsFeatured />)

    expect(
      screen.getByRole('group', {
        name: 'Inference pipeline: position to tokens to attention to policy to move',
      }),
    ).toBeInTheDocument()
  })
})
