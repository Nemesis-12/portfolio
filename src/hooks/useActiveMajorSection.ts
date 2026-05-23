import { useEffect, useState } from 'react'

export const MAJOR_SECTION_IDS = ['home', 'projects', 'skills', 'timeline', 'contact'] as const

export const ACTIVE_SECTION_SAMPLE_RATIO = 0.4

export function computeActiveMajorSection(
  sectionIds: readonly string[],
  getElement: (id: string) => HTMLElement | null,
  viewportHeight: number,
): string {
  const probeY = viewportHeight * ACTIVE_SECTION_SAMPLE_RATIO
  let current = sectionIds[0] ?? ''

  for (const id of sectionIds) {
    const element = getElement(id)
    if (!element) continue

    const rect = element.getBoundingClientRect()
    if (rect.top <= probeY && rect.bottom > probeY) {
      current = id
    }
  }

  return current
}

export function useActiveMajorSection(): string {
  const [activeSection, setActiveSection] = useState<string>(MAJOR_SECTION_IDS[0])

  useEffect(() => {
    const updateActiveSection = () => {
      setActiveSection(
        computeActiveMajorSection(
          MAJOR_SECTION_IDS,
          (id) => document.getElementById(id),
          window.innerHeight,
        ),
      )
    }

    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])

  return activeSection
}

export default useActiveMajorSection
