import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AgentCluster } from './AgentCluster'
import { AGENT_DOT_COUNT } from '@/data/otherProjects'

const FRAME_INTERVAL_MS = 260

function mockMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: reducedMotion,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('AgentCluster', () => {
  it('renders as a single labelled group, with one dot per modelled agent', () => {
    render(<AgentCluster />)

    const group = screen.getByRole('group', {
      name: 'Simulated organization of LLM agents: mostly idle or active, one occasionally flagged as an insider threat',
    })
    expect(group).toBeInTheDocument()
    expect(group.querySelectorAll('[data-agent-state]')).toHaveLength(AGENT_DOT_COUNT)
  })

  it('starts a timer under normal motion preferences', () => {
    mockMatchMedia(false)
    vi.useFakeTimers()
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')

    render(<AgentCluster />)

    expect(setIntervalSpy).toHaveBeenCalled()
  })

  it('settles on one populated frame under reduced motion, without starting a timer', () => {
    mockMatchMedia(true)
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')

    render(<AgentCluster />)

    expect(setIntervalSpy).not.toHaveBeenCalled()
    const group = screen.getByRole('group', {
      name: 'Simulated organization of LLM agents: mostly idle or active, one occasionally flagged as an insider threat',
    })
    const states = Array.from(group.querySelectorAll('[data-agent-state]')).map((el) =>
      el.getAttribute('data-agent-state'),
    )
    expect(states).toContain('flagged')
    expect(states).toContain('idle')
  })

  it('advances dot states over time under normal motion', () => {
    mockMatchMedia(false)
    vi.useFakeTimers()

    render(<AgentCluster />)
    const group = screen.getByRole('group', {
      name: 'Simulated organization of LLM agents: mostly idle or active, one occasionally flagged as an insider threat',
    })
    const before = Array.from(group.querySelectorAll('[data-agent-state]')).map((el) =>
      el.getAttribute('data-agent-state'),
    )

    act(() => {
      vi.advanceTimersByTime(FRAME_INTERVAL_MS * 12)
    })

    const after = Array.from(group.querySelectorAll('[data-agent-state]')).map((el) =>
      el.getAttribute('data-agent-state'),
    )
    expect(after).not.toEqual(before)
  })
})
