import { useCallback, useEffect, useRef, useState } from 'react'

export function useActivePanel(panelCount: number): {
  active: boolean[]
  setRef: (index: number) => (el: HTMLElement | null) => void
} {
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    panelRefs.current = panelRefs.current.slice(0, panelCount)

    const observer = new IntersectionObserver(
      (entries) => {
        const visiblePanels = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visiblePanels.length === 0) {
          return
        }

        const topmostIndex = panelRefs.current.indexOf(visiblePanels[0].target as HTMLElement)
        if (topmostIndex !== -1) {
          setActiveIndex(topmostIndex)
        }
      },
      { threshold: [0, 0.1, 0.5, 1] },
    )

    panelRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref)
      }
    })

    return () => observer.disconnect()
  }, [panelCount])

  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    panelRefs.current[index] = el
  }, [])

  const active = Array(panelCount).fill(false)
  active[activeIndex] = true

  return { active, setRef }
}

export default useActivePanel
