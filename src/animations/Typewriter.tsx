import { useState, useEffect, useRef, createElement, type ReactNode, type JSX } from 'react'

interface TypewriterProps {
  text: string
  active: boolean
  speed?: number
  delay?: number
  className?: string
  keepCursor?: boolean
  /**
   * Called once per activation, the moment this instance's delay elapses
   * and it begins typing.
   */
  onStart?: () => void
  /**
   * When true, this instance renders nothing at all (not even an empty
   * wrapper) until its `delay` elapses. Used for fields that must be
   * entirely absent from the DOM until they start, e.g. the timeline's
   * institution heading or a bullet `<li>`.
   */
  hideUntilStart?: boolean
  /**
   * Renders the component's own wrapper as this tag (e.g. 'h2', 'p', 'li')
   * instead of the default 'span', with `wrapperProps` spread onto it. Lets
   * a field's heading/list-item *be* the Typewriter's root element rather
   * than wrapping a separately-mounted Typewriter in a conditionally
   * present wrapper — wrapping it any other way would unmount and remount
   * this component when the wrapper's presence toggles, resetting its
   * typing progress and (under vitest's fake timers) silently dropping the
   * setTimeout it schedules on that remount.
   */
  wrapperTag?: keyof JSX.IntrinsicElements
  wrapperProps?: Record<string, unknown>
  children?: ReactNode
}

/**
 * Typewriter — scroll-active typewriter for the timeline.
 * Types `text` one character at a time once `active` becomes true, waiting
 * `delay` ms first. Holds the current text (doesn't blank it) while
 * `active` is false, so panels keep their progress when scrolled away.
 * Shows a `.caret` element while actively typing, and continues to show it
 * after typing completes when `keepCursor` is true.
 */
export function Typewriter({
  text,
  active,
  speed = 6,
  delay = 0,
  className,
  keepCursor = false,
  onStart,
  hideUntilStart = false,
  wrapperTag = 'span',
  wrapperProps,
  children,
}: TypewriterProps) {
  const [shown, setShown] = useState('')
  const [started, setStarted] = useState(false)
  const delayTimeoutRef = useRef<number | null>(null)
  const tickTimeoutRef = useRef<number | null>(null)
  const onStartRef = useRef(onStart)
  onStartRef.current = onStart

  useEffect(() => {
    if (!active) return

    setShown('')
    setStarted(false)
    let cancelled = false
    let i = 0

    const tick = () => {
      if (cancelled) return
      i++
      setShown(text.slice(0, i))
      if (i < text.length) {
        tickTimeoutRef.current = window.setTimeout(tick, speed)
      }
    }

    delayTimeoutRef.current = window.setTimeout(() => {
      delayTimeoutRef.current = null
      setStarted(true)
      onStartRef.current?.()
      tick()
    }, delay)

    return () => {
      cancelled = true
      if (delayTimeoutRef.current !== null) {
        window.clearTimeout(delayTimeoutRef.current)
        delayTimeoutRef.current = null
      }
      if (tickTimeoutRef.current !== null) {
        window.clearTimeout(tickTimeoutRef.current)
        tickTimeoutRef.current = null
      }
    }
  }, [active, text, speed, delay])

  if (hideUntilStart && !started) return null

  const typing = active && shown.length < text.length
  const showCaret = active && (typing || keepCursor)

  return createElement(
    wrapperTag,
    { className, ...wrapperProps },
    shown,
    showCaret && <span key="caret" className="caret" />,
    children,
  )
}
