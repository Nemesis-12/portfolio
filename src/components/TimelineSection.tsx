import { useMemo } from 'react'
import { useTypewriter } from '../animations/useTypewriter'
import { useActivePanel } from '../hooks/useActivePanel'
import { StickySection } from './StickySection'

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
      'Relevant Coursework: Machine Learning, Artificial Intelligence, Fundamentals of AI Agents, Data Science',
    ],
    category: 'education',
  },
]

const METADATA_LINE_COUNT = 3

function CommitEntry({ entry, active }: { entry: TimelineEntry; active: boolean }) {
  const lines = useMemo(
    () => [
      `commit ${entry.hash}`,
      'Author: Farhan Mohammed',
      `Date:   ${entry.dateRange}`,
      entry.institution,
      entry.role,
      ...entry.bullets,
    ],
    [entry]
  )

  const displayedLines = useTypewriter(active, lines, 16)

  const institutionLine = displayedLines[METADATA_LINE_COUNT]
  const roleLine = displayedLines[METADATA_LINE_COUNT + 1]
  const bulletLines = entry.bullets
    .map((_, index) => displayedLines[METADATA_LINE_COUNT + 2 + index])
    .filter((line): line is string => line !== undefined && line !== '')

  return (
    <div className="min-h-screen py-6 font-mono" data-testid="commit-entry">
      <div data-testid="commit-metadata">
        {displayedLines[0] !== undefined && (
          <div data-testid="commit-hash" data-typewriter-line>
            {displayedLines[0]}
          </div>
        )}
        {displayedLines[1] !== undefined && (
          <div data-testid="commit-author" data-typewriter-line>
            {displayedLines[1]}
          </div>
        )}
        {displayedLines[2] !== undefined && (
          <div data-testid="commit-date" data-typewriter-line>
            {displayedLines[2]}
          </div>
        )}
      </div>
      {institutionLine !== undefined && (
        <h2 data-testid="commit-institution" data-typewriter-line>
          {institutionLine}
        </h2>
      )}
      {roleLine !== undefined && (
        <p data-testid="commit-role" data-typewriter-line>
          {roleLine}
        </p>
      )}
      {bulletLines.length > 0 && (
        <ul data-testid="commit-details">
          {entry.bullets.map((_, index) => {
            const line = displayedLines[METADATA_LINE_COUNT + 2 + index]
            if (line === undefined) return null
            return (
              <li key={index} data-typewriter-line>
                {line}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function TimelinePanel({
  entry,
  active,
  panelRef,
  id,
}: {
  entry: TimelineEntry
  active: boolean
  panelRef: (el: HTMLElement | null) => void
  id: string
}) {
  return (
    <StickySection id={id} className="bg-graphite-light">
      <div ref={panelRef} className="min-h-screen flex flex-col justify-center py-14 px-8">
        <div data-testid="section-label" className="font-display text-atomic-tangerine mb-8">
          <span className="text-xs">//</span>{' '}
          <span className="text-sm">
            {entry.category === 'experience' ? 'EXPERIENCE' : 'EDUCATION'}
          </span>
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
      {timelineEntries.map((entry, i) => (
        <TimelinePanel
          key={entry.hash}
          entry={entry}
          active={active[i]}
          panelRef={setRef(i)}
          id={i === 0 ? 'timeline' : `timeline-${entry.hash}`}
        />
      ))}
    </>
  )
}

export default TimelineSection

export interface TimelineEntry {
  hash: string
  dateRange: string
  institution: string
  role: string
  bullets: string[]
  category: 'experience' | 'education'
}

export { timelineEntries }
