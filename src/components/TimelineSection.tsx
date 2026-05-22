import { useEffect, useMemo, useRef, useState } from 'react'
import { useTypewriter } from '../animations/useTypewriter'
import { useActivePanel } from '../hooks/useActivePanel'
import { StickySection } from './StickySection'

const TIMELINE_SECTION_NO = '// 03'

function formatPanelCount(index: number, total: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
}

function useTimelineInView(entryCount: number): boolean {
  const [inView, setInView] = useState(true)
  const visibilityRef = useRef(new Map<Element, boolean>())

  useEffect(() => {
    const sections = [
      document.getElementById('timeline'),
      ...Array.from(document.querySelectorAll('[id^="timeline-"]')),
    ].filter((section): section is HTMLElement => section instanceof HTMLElement)

    if (sections.length !== entryCount) {
      return
    }

    visibilityRef.current = new Map(sections.map((section) => [section, true]))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityRef.current.set(entry.target, entry.isIntersecting)
        })
        setInView(Array.from(visibilityRef.current.values()).some(Boolean))
      },
      { threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [entryCount])

  return inView
}

function TimelineChrome({
  activeIndex,
  progress,
  total,
  visible,
}: {
  activeIndex: number
  progress: number
  total: number
  visible: boolean
}) {
  const showScrollHint = activeIndex === 0

  return (
    <div
      data-testid="timeline-chrome"
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden={!visible}
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    >
      <div data-sticky-viewport="true" className="relative h-full w-full hscroll-sticky">
        <div className="hscroll-head">
          <span className="hscroll-no">{TIMELINE_SECTION_NO}</span>
          <span className="hscroll-name">TIMELINE</span>
          <div className="hscroll-rule" />
          <div data-testid="progress-indicator" className="hscroll-progress">
            <span data-testid="progress-count">{formatPanelCount(activeIndex, total)}</span>
            <div className="hscroll-progress-track">
              <div
                data-testid="progress-fill"
                className="hscroll-progress-fill"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div
          data-testid="scroll-hint"
          data-visible={showScrollHint}
          aria-hidden="true"
          className="hscroll-hint"
          style={{ opacity: showScrollHint ? 0.85 : 0, transition: 'opacity 0.3s' }}
        >
          SCROLL <span>↓</span>
        </div>
      </div>
    </div>
  )
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
    <div className="tl-panel" data-testid="commit-entry">
      <div data-testid="commit-metadata">
        {displayedLines[0] !== undefined && (
          <div className="tl-commit" data-testid="commit-hash" data-typewriter-line>
            {displayedLines[0]}
          </div>
        )}
        {displayedLines[1] !== undefined && (
          <div className="tl-meta" data-testid="commit-author" data-typewriter-line>
            {displayedLines[1]}
          </div>
        )}
        {displayedLines[2] !== undefined && (
          <div className="tl-meta" data-testid="commit-date" data-typewriter-line>
            {displayedLines[2]}
          </div>
        )}
      </div>
      {institutionLine !== undefined && (
        <>
          <div className="tl-sep" aria-hidden="true" />
          <h2 className="tl-org" data-testid="commit-institution" data-typewriter-line>
            {institutionLine}
          </h2>
        </>
      )}
      {roleLine !== undefined && (
        <p className="tl-title" data-testid="commit-role" data-typewriter-line>
          {roleLine}
        </p>
      )}
      {bulletLines.length > 0 && (
        <ul className="tl-bullets" data-testid="commit-details">
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
      <div ref={panelRef} className="relative min-h-screen">
        <div
          data-testid="section-label"
          className={`tl-section-tag ${entry.category}`}
        >
          <span className="tl-section-slash">//</span>
          <span className="tl-section-kind">
            {entry.category === 'experience' ? 'EXPERIENCE' : 'EDUCATION'}
          </span>
        </div>
        <CommitEntry entry={entry} active={active} />
      </div>
    </StickySection>
  )
}

const TimelineSection: React.FC = () => {
  const entryCount = timelineEntries.length
  const { active, activeIndex, progress, setRef } = useActivePanel(entryCount)
  const inView = useTimelineInView(entryCount)

  return (
    <>
      <TimelineChrome
        activeIndex={activeIndex}
        progress={progress}
        total={entryCount}
        visible={inView}
      />
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
