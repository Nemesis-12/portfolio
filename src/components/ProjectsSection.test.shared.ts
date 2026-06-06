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
