import { vi } from 'vitest'
import { getTimelineTrackTranslate } from './timelineGeometry'

const {
  DEFAULT_ACTIVE,
  mockTimelineScrollState,
  getTimelinePanel,
  mockUseTimelineScroll,
} = vi.hoisted(() => {
  const DEFAULT_ACTIVE = [true, false, false, false] as const

  function mockTimelineScrollState(
    active: boolean[],
    options: { activeIndex?: number; progress?: number; tx?: number } = {},
  ) {
    const detectedIndex = active.findIndex(Boolean)
    const activeIndex = options.activeIndex ?? (detectedIndex === -1 ? 0 : detectedIndex)
    const entryCount = active.length

    return {
      active,
      activeIndex,
      progress: options.progress ?? (entryCount <= 1 ? 0 : activeIndex / (entryCount - 1)),
      tx: options.tx ?? getTimelineTrackTranslate(activeIndex, entryCount, 1000),
    }
  }

  function getTimelinePanel(contentIndex: number) {
    return document.querySelector(`[data-content-index="${contentIndex}"]`) as HTMLElement
  }

  const mockUseTimelineScroll = vi.fn(() => mockTimelineScrollState([...DEFAULT_ACTIVE]))

  return { DEFAULT_ACTIVE, mockTimelineScrollState, getTimelinePanel, mockUseTimelineScroll }
})

vi.mock('../hooks/useTimelineScroll', () => ({
  useTimelineScroll: mockUseTimelineScroll,
}))

export { DEFAULT_ACTIVE, mockTimelineScrollState, getTimelinePanel, mockUseTimelineScroll }
