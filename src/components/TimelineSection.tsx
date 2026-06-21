import { useMemo, useRef, useState } from 'react'
import { Typewriter } from '../animations/Typewriter'
import type { TimelineEntry } from '../data/timeline'
import { timelineEntries } from '../data/timeline'
import { useTimelineScroll } from '../hooks/useTimelineScroll'
import { getTimelineScrollRangeVh, getTimelineSnapAnchorTopVh } from './timelineGeometry'

const TIMELINE_SECTION_NO = '// 03'

function formatPanelCount(index: number, total: number): string {
  return `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`
}

const BASE_DELAY = 30

/**
 * Renders a single commit panel's typed fields.
 *
 * Every `Typewriter` is mounted unconditionally from the very first render
 * (gated only by its own `delay`/`hideUntilStart` props), rather than being
 * mounted later in response to a parent state change. Mounting a *new*
 * `Typewriter` from inside a timer-driven re-render would register a fresh
 * setTimeout from that freshly-mounted child's effect, and under vitest's
 * fake timers a single `act(() => vi.advanceTimersByTime(N))` call does not
 * reliably pick up timers registered that late within the same pass.
 * Fields that must be entirely absent from the DOM until they start
 * (institution, role, each bullet) use `hideUntilStart` so the same
 * long-lived Typewriter instance renders its own wrapper tag directly
 * (`wrapperTag`/`wrapperProps`) instead of being wrapped by a separately
 * conditionally-rendered parent element, which would itself force a
 * remount.
 */
function CommitEntry({ entry, active }: { entry: TimelineEntry; active: boolean }) {
  const [institutionStarted, setInstitutionStarted] = useState(false)

  // Reset gating state whenever this panel re-activates (false -> true) or
  // the entry changes, so re-activating restarts from scratch instead of
  // holding stale gates. We deliberately do NOT reset when going active ->
  // inactive: the panel must keep showing whatever it had typed so far
  // (mirrors the reference Typewriter's "keep current shown so panels don't
  // blank during slide-out" behavior), so `institutionStarted` must survive
  // a deactivation and only resets the moment the panel goes active again.
  // This is a state update during render (not inside an effect), so it is
  // applied before this render commits and never depends on a timer firing
  // mid-`advanceTimersByTime` pass.
  const [trackedKey, setTrackedKey] = useState(`${entry.hash}:${active}`)
  const key = `${entry.hash}:${active}`
  if (key !== trackedKey) {
    setTrackedKey(key)
    if (active) {
      setInstitutionStarted(false)
    }
  }

  // Until the panel has been active at least once, render nothing: a panel
  // that has never been scrolled to must have zero typewriter DOM (per
  // "inactive panels remain empty"). Once it has activated, keep the full
  // tree mounted forever after — even while later inactive — so the
  // already-mounted Typewriters hold their last-typed text instead of being
  // unmounted and losing it.
  const hasActivatedRef = useRef(active)
  if (active) {
    hasActivatedRef.current = true
  }
  if (!hasActivatedRef.current) {
    return (
      <div className="tl-panel" data-testid="commit-entry">
        <div data-testid="commit-metadata" />
      </div>
    )
  }

  return (
    <div className="tl-panel" data-testid="commit-entry">
      <div data-testid="commit-metadata">
        <Typewriter
          text={`commit ${entry.hash}`}
          active={active}
          delay={0}
          speed={6}
          hideUntilStart
          wrapperTag="div"
          wrapperProps={{
            className: 'tl-commit',
            'data-testid': 'commit-hash',
            'data-typewriter-line': true,
          }}
        />
        <Typewriter
          text="Author: Farhan Mohammed"
          active={active}
          delay={BASE_DELAY}
          speed={6}
          hideUntilStart
          wrapperTag="div"
          wrapperProps={{
            className: 'tl-meta',
            'data-testid': 'commit-author',
            'data-typewriter-line': true,
          }}
        />
        <Typewriter
          text={`Date:   ${entry.dateRange}`}
          active={active}
          delay={BASE_DELAY * 2}
          speed={6}
          hideUntilStart
          wrapperTag="div"
          wrapperProps={{
            className: 'tl-meta',
            'data-testid': 'commit-date',
            'data-typewriter-line': true,
          }}
        />
      </div>
      {institutionStarted && <div className="tl-sep" aria-hidden="true" />}
      <Typewriter
        text={entry.institution}
        active={active}
        delay={BASE_DELAY * 4}
        speed={10}
        keepCursor
        hideUntilStart
        onStart={() => setInstitutionStarted(true)}
        wrapperTag="h2"
        wrapperProps={{
          className: 'tl-org',
          'data-testid': 'commit-institution',
          'data-typewriter-line': true,
        }}
      />
      <Typewriter
        text={entry.role}
        active={active}
        delay={BASE_DELAY * 7}
        speed={6}
        keepCursor
        hideUntilStart
        wrapperTag="p"
        wrapperProps={{
          className: 'tl-title',
          'data-testid': 'commit-role',
          'data-typewriter-line': true,
        }}
      />
      {entry.bullets.length > 0 && (
        <ul className="tl-bullets" data-testid="commit-details">
          {entry.bullets.map((bullet, index) => (
            <Typewriter
              key={index}
              text={bullet}
              active={active}
              delay={BASE_DELAY * 10 + index * 120}
              speed={6}
              hideUntilStart
              wrapperTag="li"
              wrapperProps={{ 'data-typewriter-line': true }}
            />
          ))}
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
      className="relative hscroll min-h-screen bg-graphite"
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
