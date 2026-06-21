import { useState, useEffect, useRef } from 'react'

interface TypeInProps {
  start: boolean
  text: string
  speed?: number
  delay?: number
  onDone?: () => void
}

export function TypeIn({ start, text, speed = 40, delay = 0, onDone }: TypeInProps) {
  const [displayed, setDisplayed] = useState('')
  const delayTimeoutRef = useRef<number | null>(null)
  const tickTimeoutRef = useRef<number | null>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!start) return

    setDisplayed('')
    let cancelled = false
    let currentIndex = 0

    const tick = () => {
      if (cancelled) return

      if (currentIndex <= text.length) {
        setDisplayed(text.slice(0, currentIndex))
        currentIndex++

        if (currentIndex <= text.length) {
          tickTimeoutRef.current = window.setTimeout(tick, speed)
        } else {
          onDoneRef.current?.()
        }
      }
    }

    if (delay > 0) {
      delayTimeoutRef.current = window.setTimeout(() => {
        delayTimeoutRef.current = null
        tick()
      }, delay)
    } else {
      tick()
    }

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
  }, [start, text, speed, delay])

  if (!start) return null

  return <span>{displayed}</span>
}
