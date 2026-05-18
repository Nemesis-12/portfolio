import { StickySection } from './StickySection'
import { Typewriter } from '../animations/Typewriter'
import { useActivePanel } from '../hooks/useActivePanel'

interface TimelineEntry {
  hash: string
  dateRange: string
  institution: string
  role: string
  bullets: string[]
  category: 'experience' | 'education'
}

const timelineEntries: TimelineEntry[] = [
  {
    hash: 'd4e8f2c',
    dateRange: 'AUG 2024 – PRESENT',
    institution: 'NETAPP INC.',
    role: 'SOFTWARE_ENGINEER_IN_TEST',
    bullets: [
      'Built automated analysis pipeline processing storage telemetry across distributed RAID systems (FC, SAS, NVMe/RoCE), handling terabytes of performance data.',
      'Designed Python automation framework reducing manual configuration tasks by 30% across Linux, Windows, and VMware infrastructure.',
      'Implemented Ansible-based deployment orchestration for 300+ system configurations, streamlining infrastructure provisioning workflows.',
      'Developed interactive visualization dashboard for system performance metrics using Python, analyzing 1M+ database entries for engineering insights.',
    ],
    category: 'experience',
  },
  {
    hash: 'a3f9d2b',
    dateRange: 'JAN 2026 – DEC 2027 (EXPECTED)',
    institution: 'WICHITA STATE UNIVERSITY',
    role: 'ACCELERATED_M.S._COMPUTER_SCIENCE',
    bullets: [],
    category: 'education',
  },
  {
    hash: 'b7c3e1a',
    dateRange: 'JAN 2022 – DEC 2025',
    institution: 'WICHITA STATE UNIVERSITY',
    role: 'B.S._COMPUTER_SCIENCE',
    bullets: [
      "Dean's List: Spring 2022 – Fall 2025",
      "Relevant Coursework: Machine Learning, Artificial Intelligence, Fundamentals of AI Agents, Data Science",
    ],
    category: 'education',
  },
]

function CommitEntry({ entry, active }: { entry: TimelineEntry; active: boolean }) {
  const lines = [
    `commit ${entry.hash}`,
    'Author: Farhan Mohammed',
    `Date:   ${entry.dateRange}`,
    entry.institution,
    entry.role,
    ...entry.bullets,
  ]

  return (
    <div className="min-h-screen py-6 font-mono" data-testid="commit-entry">
      <Typewriter active={active} lines={lines} speed={25} />
    </div>
  )
}

function TimelinePanel({ entry, active, panelRef }: { entry: TimelineEntry; active: boolean; panelRef: (el: HTMLElement | null) => void }) {
  return (
    <StickySection id={`timeline-${entry.hash}`} className="bg-graphite-light">
      <div ref={panelRef} className="min-h-screen flex flex-col justify-center py-14 px-8">
        <div data-testid="section-label" className="font-display text-atomic-tangerine mb-8">
          <span className="text-xs">//</span>{' '}
          <span className="text-sm">{entry.category === 'experience' ? 'EXPERIENCE' : 'EDUCATION'}</span>
        </div>
        <CommitEntry entry={entry} active={active} />
      </div>
    </StickySection>
  )
}

const TimelineSection: React.FC = () => {
  const { active, setRef } = useActivePanel(timelineEntries.length)

  return (
    <>
      <span id="timeline" aria-hidden="true" className="sr-only" />
      {timelineEntries.map((entry, i) => (
        <TimelinePanel key={entry.hash} entry={entry} active={active[i]} panelRef={setRef(i)} />
      ))}
    </>
  )
}

export default TimelineSection
