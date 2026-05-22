import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { useActivePanel } from './useActivePanel'

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    writable: true,
    value: height,
  })
}

function createRect(top: number, height: number): DOMRect {
  return {
    top,
    bottom: top + height,
    left: 0,
    right: window.innerWidth,
    width: window.innerWidth,
    height,
    x: 0,
    y: top,
    toJSON: () => ({}),
  }
}

describe('useActivePanel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('issue #158 - deterministic active panel detection', () => {
    it('returns exactly one active panel at a time', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(0, 800)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(3)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      const active = result.current
      const trueCount = active.filter(Boolean).length
      expect(trueCount).toBe(1)
    })

    it('first panel is active when at top of timeline (all panels below viewport)', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        // Panel 0 at viewport top, panels 1 and 2 below
        const rects = [
          { top: 0, height: 800 },
          { top: 800, height: 800 },
          { top: 1600, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(3)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current).toEqual([true, false, false])
    })

    it('second panel becomes active when it reaches sticky position', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        // Panel 0 scrolled past, panel 1 at sticky top, panel 2 below
        const rects = [
          { top: -800, height: 800 },
          { top: 0, height: 800 },
          { top: 800, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(3)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current).toEqual([false, true, false])
    })

    it('third panel becomes active when it reaches sticky position', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        // Panels 0 and 1 scrolled past, panel 2 at sticky top
        const rects = [
          { top: -1600, height: 800 },
          { top: -800, height: 800 },
          { top: 0, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(3)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current).toEqual([false, false, true])
    })

    it('active index changes in newest-first order while scrolling down', () => {
      setViewport(1000, 800)

      // Simulate scroll progression: top -> middle -> bottom
      const scenarios = [
        // At top: panel 0 active
        { rects: [{ top: 0, height: 800 }, { top: 800, height: 800 }, { top: 1600, height: 800 }], expected: [true, false, false] },
        // Scrolled a bit: panel 0 still active (panel 1 entering)
        { rects: [{ top: -200, height: 800 }, { top: 600, height: 800 }, { top: 1400, height: 800 }], expected: [true, false, false] },
        // Panel 1 reached sticky: panel 1 active
        { rects: [{ top: -800, height: 800 }, { top: 0, height: 800 }, { top: 800, height: 800 }], expected: [false, true, false] },
        // Panel 2 reached sticky: panel 2 active
        { rects: [{ top: -1600, height: 800 }, { top: -800, height: 800 }, { top: 0, height: 800 }], expected: [false, false, true] },
      ]

      for (const scenario of scenarios) {
        const { result, unmount } = renderHook(() => {
          const elements: HTMLElement[] = []
          for (let i = 0; i < 3; i++) {
            const el = document.createElement('div')
            el.getBoundingClientRect = vi.fn(() =>
              createRect(scenario.rects[i].top, scenario.rects[i].height)
            )
            elements.push(el)
          }

          const { active, setRef } = useActivePanel(3)
          elements.forEach((el, i) => setRef(i)(el))

          return active
        })

        act(() => window.dispatchEvent(new Event('scroll')))

        expect(result.current).toEqual(scenario.expected)
        unmount()
      }
    })

    it('does not flicker when two sticky panels intersect (tie-breaking by DOM order)', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        // Both panels at same top position (both sticky at top: 0)
        // Higher DOM index (panel 1) should win
        const rects = [
          { top: 0, height: 800 },
          { top: 0, height: 800 },
          { top: 800, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(3)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      // Panel 1 (higher DOM index) wins the tie
      expect(result.current).toEqual([false, true, false])
    })

    it('last panel stays active when all panels have scrolled past', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        // All panels scrolled past viewport
        const rects = [
          { top: -2400, height: 800 },
          { top: -1600, height: 800 },
          { top: -800, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(3)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      // Last panel remains active
      expect(result.current).toEqual([false, false, true])
    })

    it('returns deterministic result across multiple scroll events at same position', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        const rects = [
          { top: -800, height: 800 },
          { top: 0, height: 800 },
          { top: 800, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(3)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      // Fire multiple scroll events
      for (let i = 0; i < 10; i++) {
        act(() => window.dispatchEvent(new Event('scroll')))
        expect(result.current).toEqual([false, true, false])
      }
    })

    it('recalculates active panel on resize', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        const rects = [
          { top: -800, height: 800 },
          { top: 0, height: 800 },
          { top: 800, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(3)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))
      expect(result.current).toEqual([false, true, false])

      // Resize shouldn't change the result since panel positions are relative
      act(() => window.dispatchEvent(new Event('resize')))
      expect(result.current).toEqual([false, true, false])
    })

    it('handles single panel correctly', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const el = document.createElement('div')
        el.getBoundingClientRect = vi.fn(() => createRect(0, 800))

        const { active, setRef } = useActivePanel(1)
        setRef(0)(el)

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current).toEqual([true])
    })

    it('handles two panels correctly', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        const rects = [
          { top: -800, height: 800 },
          { top: 0, height: 800 },
        ]
        for (let i = 0; i < 2; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const { active, setRef } = useActivePanel(2)
        elements.forEach((el, i) => setRef(i)(el))

        return active
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current).toEqual([false, true])
    })
  })

  describe('issue #206 - timeline scroll progress', () => {
    it('exposes activeIndex matching the active panel', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        const rects = [
          { top: -800, height: 800 },
          { top: 0, height: 800 },
          { top: 800, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const hook = useActivePanel(3)
        elements.forEach((el, i) => hook.setRef(i)(el))

        return hook
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current.activeIndex).toBe(1)
    })

    it('progress is 0 at the first panel beat', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        const rects = [
          { top: 0, height: 800 },
          { top: 800, height: 800 },
          { top: 1600, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const hook = useActivePanel(3)
        elements.forEach((el, i) => hook.setRef(i)(el))

        return hook
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current.progress).toBe(0)
    })

    it('progress reaches 1 on the last panel beat', () => {
      setViewport(1000, 800)

      const { result } = renderHook(() => {
        const elements: HTMLElement[] = []
        const rects = [
          { top: -1600, height: 800 },
          { top: -800, height: 800 },
          { top: 0, height: 800 },
        ]
        for (let i = 0; i < 3; i++) {
          const el = document.createElement('div')
          el.getBoundingClientRect = vi.fn(() =>
            createRect(rects[i].top, rects[i].height)
          )
          elements.push(el)
        }

        const hook = useActivePanel(3)
        elements.forEach((el, i) => hook.setRef(i)(el))

        return hook
      })

      act(() => window.dispatchEvent(new Event('scroll')))

      expect(result.current.progress).toBe(1)
    })
  })
})
