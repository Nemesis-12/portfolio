import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CopyInstallCommand } from './CopyInstallCommand'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('CopyInstallCommand', () => {
  it('shows the command as plain, readable text', () => {
    render(<CopyInstallCommand command="pip install multihead-latent-attention" />)

    expect(screen.getByText('pip install multihead-latent-attention')).toBeInTheDocument()
  })

  it('copies the command to the clipboard and shows a confirmation, then reverts', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })

    render(<CopyInstallCommand command="pip install multihead-latent-attention" />)

    await act(async () => {
      screen.getByRole('button', { name: 'copy' }).click()
    })

    expect(writeText).toHaveBeenCalledWith('pip install multihead-latent-attention')
    expect(screen.getByRole('button', { name: 'copied' })).toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(1500)
    })
    expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument()
  })

  it('does not throw when the Clipboard API is unavailable', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })

    render(<CopyInstallCommand command="pip install multihead-latent-attention" />)

    await act(async () => {
      screen.getByRole('button', { name: 'copy' }).click()
    })

    expect(screen.getByRole('button', { name: 'copy' })).toBeInTheDocument()
  })
})
