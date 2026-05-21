import { useCallback, useEffect, useRef, useState } from 'react'

function computeActiveIndex(panelRefs: (HTMLElement | null)[]): number {
  const count = panelRefs.length
  if (count === 0) return 0
  if (count === 1) return 0

  let activeIndex = 0

  for (let i = count - 1; i >= 0; i--) {
    const ref = panelRefs[i]
    if (!ref) continue

    const rect = ref.getBoundingClientRect()
    if (rect.top <= 0) {
      activeIndex = i
      break
    }
  }

  return activeIndex
}

export function useActivePanel(panelCount: number): {
  active: boolean[]
  setRef: (index: number) => (el: HTMLElement | null) => void
} {
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRefs = useRef<(HTMLElement | null)[]>([])

  const updateActiveIndex = useCallback(() => {
    const next = computeActiveIndex(panelRefs.current)
    setActiveIndex(next)
  }, [])

  useEffect(() => {
    panelRefs.current = panelRefs.current.slice(0, panelCount)

    updateActiveIndex()

    window.addEventListener('scroll', updateActiveIndex, { passive: true })
    window.addEventListener('resize', updateActiveIndex)

    return () => {
      window.removeEventListener('scroll', updateActiveIndex)
      window.removeEventListener('resize', updateActiveIndex)
    }
  }, [panelCount, updateActiveIndex])

  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    panelRefs.current[index] = el
  }, [])

  const active = Array(panelCount).fill(false)
  active[activeIndex] = true

  return { active, setRef }
}

export default useActivePanel
