import { useMemo, useRef } from 'react'
import { useTypewriter } from '../animations/useTypewriter'
import type { TimelineEntry } from '../data/timeline'
import { timelineEntries } from '../data/timeline'
import { useTimelineScroll } from '../hooks/useTimelineScroll'
import { getTimelineScrollRangeVh, getTimelineSnapAnchorTopVh } from './timelineGeometry'

const TIMELINE_SECTION_NO = '// 03'
const TIMELINE_TYPE_SPEED_MS = 7

function formatPanelCount(index: number, total: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
}

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
    [entry],
  )

  const displayedLines = useTypewriter(active, lines, TIMELINE_TYPE_SPEED_MS, undefined, {
    mode: 'parallel',
    restartOnActivate: true,
  })

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
  contentIndex,
}: {
  entry: TimelineEntry
  active: boolean
  contentIndex: number
}) {
  return (
    <div
      data-testid="timeline-panel"
      data-content-index={contentIndex}
      className="tl-panel-shell"
    >
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
  )
}

const TimelineSection: React.FC = () => {
  const outerRef = useRef<HTMLElement>(null)
  const entryCount = timelineEntries.length
  const scrollRangeVh = getTimelineScrollRangeVh(entryCount)
  const { active, activeIndex, progress, tx } = useTimelineScroll(outerRef, entryCount)
  const trackEntries = useMemo(() => [...timelineEntries].reverse(), [])

  return (
    <section
      ref={outerRef}
      id="timeline"
      data-sticky-scroll-host="true"
      className="relative hscroll min-h-screen bg-graphite-light"
      style={{ height: `${scrollRangeVh * 100}vh`, overflowX: 'clip' }}
    >
      {timelineEntries.map((entry, index) => (
        <div
          key={entry.hash}
          data-testid="timeline-snap-anchor"
          className="snap-anchor"
          style={{ top: `${getTimelineSnapAnchorTopVh(index)}vh` }}
          aria-hidden="true"
        />
      ))}

      <div data-sticky-viewport="true" className="hscroll-sticky flex flex-col">
        <div className="hscroll-head">
          <span className="hscroll-no">{TIMELINE_SECTION_NO}</span>
          <span className="hscroll-name">TIMELINE</span>
          <div className="hscroll-rule" />
          <div data-testid="progress-indicator" className="hscroll-progress">
            <span data-testid="progress-count">{formatPanelCount(activeIndex, entryCount)}</span>
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
          data-timeline-track="true"
          className="hscroll-track"
          style={{
            transform: `translateX(${tx}px)`,
            transition: 'transform 0.35s var(--ease)',
          }}
        >
          {trackEntries.map((entry, reversedIndex) => {
            const contentIndex = entryCount - 1 - reversedIndex
            return (
              <TimelinePanel
                key={entry.hash}
                entry={entry}
                active={active[contentIndex]}
                contentIndex={contentIndex}
              />
            )
          })}
        </div>

        <div
          data-testid="scroll-hint"
          data-visible={activeIndex === 0}
          aria-hidden="true"
          className="hscroll-hint"
          style={{ opacity: activeIndex === 0 ? 0.85 : 0, transition: 'opacity 0.3s' }}
        >
          SCROLL <span>↓</span>
        </div>
      </div>
    </section>
  )
}

export default TimelineSection
