import { describe, it, expect, vi, afterEach } from 'vitest'
import { handleSectionLinkClick, smoothScrollToSection } from './smoothScrollTo'

describe('smoothScrollToSection', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('scrolls to the target section top with smooth behavior', () => {
    const section = document.createElement('section')
    section.id = 'projects'
    Object.defineProperty(section, 'offsetTop', { configurable: true, value: 1200 })
    document.body.appendChild(section)

    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    smoothScrollToSection('projects')

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 1200, behavior: 'smooth' })
  })

  it('no-ops when the section is missing', () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    smoothScrollToSection('missing')

    expect(scrollToSpy).not.toHaveBeenCalled()
  })
})

describe('handleSectionLinkClick', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('prevents default navigation and smooth-scrolls to the section', () => {
    const section = document.createElement('section')
    section.id = 'skills'
    Object.defineProperty(section, 'offsetTop', { configurable: true, value: 1800 })
    document.body.appendChild(section)

    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const preventDefault = vi.fn()
    const event = { preventDefault } as unknown as Parameters<typeof handleSectionLinkClick>[0]

    handleSectionLinkClick(event, 'skills')

    expect(preventDefault).toHaveBeenCalled()
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 1800, behavior: 'smooth' })
  })
})
