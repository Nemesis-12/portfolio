import { useLayoutEffect, type RefObject } from 'react'

const MIN_SCALE = 0.95
const MIN_OPACITY = 0.75
const STICKY_SECTION_SELECTOR = '[data-sticky-section="true"]'

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

function formatNumber(value: number) {
  return Number(value.toFixed(3)).toString()
}

/** Applies the shared card-deck z-index, scale, and opacity behavior to a stack surface. */
export function useCardDeckDepth(sectionRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return undefined
    }

    const updateCardDepth = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>(STICKY_SECTION_SELECTOR))
      const sectionIndex = sections.indexOf(section)
      const nextSection = sections[sectionIndex + 1]

      section.style.zIndex = String(sectionIndex + 1)

      if (!nextSection) {
        section.style.transform = 'scale(1)'
        section.style.opacity = '1'
        return
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const nextTop = nextSection.getBoundingClientRect().top
      const progress = clamp(1 - nextTop / viewportHeight)
      const scale = 1 - (1 - MIN_SCALE) * progress
      const opacity = 1 - (1 - MIN_OPACITY) * progress

      section.style.transform = `scale(${formatNumber(scale)})`
      section.style.opacity = formatNumber(opacity)
    }

    updateCardDepth()
    window.addEventListener('scroll', updateCardDepth, { passive: true })
    window.addEventListener('resize', updateCardDepth)

    return () => {
      window.removeEventListener('scroll', updateCardDepth)
      window.removeEventListener('resize', updateCardDepth)
    }
  }, [sectionRef])
}
