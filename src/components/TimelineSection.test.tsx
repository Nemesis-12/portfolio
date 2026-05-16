import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import TimelineSection from './TimelineSection'

describe('TimelineSection', () => {
  it('each entry has min-h-screen', () => {
    render(<TimelineSection />)
    const commitEntries = screen.getAllByTestId('commit-entry')
    expect(commitEntries.length).toBe(3)
    commitEntries.forEach(entry => {
      expect(entry).toHaveClass('min-h-screen')
    })
  })

  it('entries start empty (typewriter effect)', () => {
    render(<TimelineSection />)
    
    const hashElements = screen.getAllByTestId('commit-hash')
    const authorElements = screen.getAllByTestId('commit-author')
    const dateElements = screen.getAllByTestId('commit-date')
    const institutionElements = screen.getAllByTestId('commit-institution')
    const roleElements = screen.getAllByTestId('commit-role')
    const descriptionElements = screen.getAllByTestId('commit-description')

    expect(hashElements.length).toBe(3)
    expect(authorElements.length).toBe(3)
    expect(dateElements.length).toBe(3)
    expect(institutionElements.length).toBe(3)
    expect(roleElements.length).toBe(3)
    expect(descriptionElements.length).toBe(3)

    hashElements.forEach(el => expect(el).toHaveTextContent(''))
    authorElements.forEach(el => expect(el).toHaveTextContent(''))
    dateElements.forEach(el => expect(el).toHaveTextContent(''))
    institutionElements.forEach(el => expect(el).toHaveTextContent(''))
    roleElements.forEach(el => expect(el).toHaveTextContent(''))
    descriptionElements.forEach(el => expect(el).toHaveTextContent(''))
  })
})