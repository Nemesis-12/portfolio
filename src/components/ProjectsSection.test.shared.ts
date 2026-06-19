import { vi } from 'vitest'

export const mockProjects = [
  {
    id: '1',
    title: 'Project One',
    description: 'Description for project one',
    tags: ['React', 'TypeScript'],
    links: [
      { label: 'GitHub', url: 'https://github.com/project1' },
      { label: 'Demo', url: 'https://demo.project1.com' },
    ],
    image: 'https://example.com/image1.png',
    bullets: [
      'First bullet point for project one',
      'Second bullet point for project one',
    ],
  },
  {
    id: '2',
    title: 'Project Two',
    description: 'Description for project two',
    tags: ['Node.js', 'Express'],
    links: [{ label: 'Docs', url: 'https://docs.project2.com' }],
  },
]

export function setViewport(width: number, height: number) {
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

export function createRect(top: number, height: number): DOMRect {
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

/**
 * Mocks the carousel track's first/last child rects so `useHorizontalScroll` measures the
 * given `trackWidth` exactly as it would in a real browser (via child rects, not
 * `scrollWidth` — see `useHorizontalScroll.ts` for why `scrollWidth` itself is unreliable
 * for this flex layout). `carouselTrack` must already have its real children rendered.
 */
export function mockCarouselTrackWidth(carouselTrack: HTMLElement, trackWidth: number) {
  const first = carouselTrack.firstElementChild as HTMLElement | null
  const last = carouselTrack.lastElementChild as HTMLElement | null
  if (!first || !last) {
    throw new Error('mockCarouselTrackWidth requires a track with rendered children')
  }

  vi.spyOn(first, 'getBoundingClientRect').mockReturnValue({
    ...createRect(0, 0),
    left: 0,
    right: 0,
  })
  vi.spyOn(last, 'getBoundingClientRect').mockReturnValue({
    ...createRect(0, 0),
    left: trackWidth,
    right: trackWidth,
  })
}
