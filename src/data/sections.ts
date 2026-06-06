export const SECTIONS = [
  { id: 'home', navLabel: 'HOME' },
  { id: 'projects', navLabel: 'PROJECTS' },
  { id: 'skills', navLabel: 'SKILLS' },
  { id: 'timeline', navLabel: 'TIMELINE' },
  { id: 'contact', navLabel: 'CONTACT' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export type Section = (typeof SECTIONS)[number]
