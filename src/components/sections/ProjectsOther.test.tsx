import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectsOther } from './ProjectsOther'
import {
  MLA_INSTALL_COMMAND,
  MLA_LINKS,
  MLA_TAGLINE,
  OTHER_PROJECTS_TITLE,
  THESIS_STATS,
  THESIS_TAGLINE,
  THESIS_TITLE,
} from '@/data/otherProjects'
import { getSectionMeta } from '@/data/sections'

/**
 * Smoke coverage for issue #318: this component is pure presentation over
 * `src/data/otherProjects.ts`, so the real correctness weight sits in
 * `src/lib/otherProjects/agentCluster.test.ts` and
 * `CopyInstallCommand.test.tsx` instead. These assertions check the public
 * interface: the section landmark, no duplicated eyebrow number, the
 * install command, the thesis's running indicator and stats, and the
 * animated cluster mounting.
 */
describe('ProjectsOther', () => {
  it('renders the second projects section with its documented id, named by its own heading', () => {
    render(<ProjectsOther />)

    const meta = getSectionMeta('more')
    const region = screen.getByRole('region', { name: OTHER_PROJECTS_TITLE })
    expect(region).toHaveAttribute('id', meta.id)
  })

  it('carries no eyebrow section number, unlike the featured screen', () => {
    render(<ProjectsOther />)

    expect(screen.queryByText(/^01/)).not.toBeInTheDocument()
    expect(screen.queryByText(/PROJECTS$/)).not.toBeInTheDocument()
  })

  it('presents the MLA library with its taglines and the corrected install command', () => {
    render(<ProjectsOther />)

    expect(screen.getByText(MLA_TAGLINE)).toBeInTheDocument()
    expect(screen.getByText(MLA_INSTALL_COMMAND)).toBeInTheDocument()
  })

  it('links to the MLA source and package with the correct URLs', () => {
    render(<ProjectsOther />)

    for (const link of MLA_LINKS) {
      const anchor = screen.getByRole('link', { name: new RegExp(link.label, 'i') })
      expect(anchor).toHaveAttribute('href', link.href)
      expect(anchor).toHaveAttribute('target', '_blank')
    }
  })

  it('shows the thesis running indicator, its title, and its stats', () => {
    render(<ProjectsOther />)

    expect(screen.getByText(THESIS_TAGLINE)).toBeInTheDocument()
    expect(screen.getByText('RUNNING')).toBeInTheDocument()
    expect(screen.getByText(THESIS_TITLE)).toBeInTheDocument()

    for (const stat of THESIS_STATS) {
      expect(screen.getByText(stat.value)).toBeInTheDocument()
      expect(screen.getByText(stat.label)).toBeInTheDocument()
    }
  })

  it('renders the animated agent-dot cluster illustrating the thesis', () => {
    render(<ProjectsOther />)

    expect(
      screen.getByRole('group', {
        name: 'Simulated organization of LLM agents: mostly idle or active, one occasionally flagged as an insider threat',
      }),
    ).toBeInTheDocument()
  })
})
