import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the under-construction placeholder copy', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /under construction/i })).toBeInTheDocument()
    expect(screen.getByText(/being rebuilt from scratch/i)).toBeInTheDocument()
  })
})
