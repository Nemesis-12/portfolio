import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from './useTypewriter'

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('issue #221 - typewriter persistence', () => {
    it('holds partial lines when active becomes false', () => {
      const lines = ['commit abc123', 'Author: Test User']
      const { result, rerender } = renderHook(
        ({ active }) => useTypewriter(active, lines, 16),
        { initialProps: { active: true } },
      )

      act(() => {
        vi.advanceTimersByTime(50)
      })

      const partial = [...result.current]
      expect(partial[0]?.length).toBeGreaterThan(0)

      rerender({ active: false })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current).toEqual(partial)
    })

    it('resumes typing from held position when active becomes true again', () => {
      const lines = ['Hello world']
      const { result, rerender } = renderHook(
        ({ active }) => useTypewriter(active, lines, 16),
        { initialProps: { active: true } },
      )

      act(() => {
        vi.advanceTimersByTime(32)
      })

      const partialLength = result.current[0]?.length ?? 0
      expect(partialLength).toBeGreaterThan(0)

      rerender({ active: false })
      rerender({ active: true })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current[0]?.length ?? 0).toBeGreaterThan(partialLength)
    })

    it('stays empty when never activated', () => {
      const lines = ['commit abc123']
      const { result } = renderHook(() => useTypewriter(false, lines, 16))

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current).toEqual([])
    })

    it('keeps completed lines visible after deactivation', () => {
      const lines = ['Done']
      const { result, rerender } = renderHook(
        ({ active }) => useTypewriter(active, lines, 16),
        { initialProps: { active: true } },
      )

      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current[0]).toBe('Done')

      rerender({ active: false })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current[0]).toBe('Done')
    })
  })
})
