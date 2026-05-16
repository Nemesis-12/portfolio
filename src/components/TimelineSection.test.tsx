import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TimelineSection from './TimelineSection'

describe('TimelineSection', () => {
  it('renders commit hash in atomic-tangerine', () => {
    render(<TimelineSection />)
    const hashElements = screen.getAllByText(/^commit [a-f0-9]{7}$/i)
    expect(hashElements.length).toBeGreaterThan(0)
    expect(hashElements[0]).toHaveClass('text-atomic-tangerine')
  })

  it('renders author line', () => {
    render(<TimelineSection />)
    expect(screen.getAllByText(/^Author:/).length).toBeGreaterThan(0)
  })

  it('renders date line', () => {
    render(<TimelineSection />)
    expect(screen.getAllByText(/^Date:/).length).toBeGreaterThan(0)
  })

  it('renders institution in commit body', () => {
    render(<TimelineSection />)
    expect(screen.getAllByText('WICHITA STATE UNIVERSITY').length).toBeGreaterThan(0)
  })

  it('renders role title in commit body', () => {
    render(<TimelineSection />)
    expect(screen.getAllByText(/M.S._COMPUTER_SCIENCE/).length).toBeGreaterThan(0)
  })

  it('renders description in commit body', () => {
    render(<TimelineSection />)
    expect(screen.getAllByText(/Accelerated graduate program/).length).toBeGreaterThan(0)
  })
})