import type { MouseEvent } from 'react'

export function smoothScrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId)
  if (!element) return

  window.scrollTo({ top: element.offsetTop, behavior: 'smooth' })
}

export function handleSectionLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  sectionId: string,
): void {
  event.preventDefault()
  smoothScrollToSection(sectionId)
}
