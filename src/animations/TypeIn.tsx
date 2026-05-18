import { useState, useEffect, useRef } from 'react'

interface TypeInProps {
  start: boolean
  text: string
  speed?: number
  onDone?: () => void
}

export function TypeIn({ start, text, speed = 40, onDone }: TypeInProps) {
  const [displayed, setDisplayed] = useState('')
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!start) return

    let cancelled = false
    let currentIndex = 0

    const tick = () => {
      if (cancelled) return

      if (currentIndex <= text.length) {
        setDisplayed(text.slice(0, currentIndex))
        currentIndex++

        if (currentIndex <= text.length) {
          timeoutRef.current = window.setTimeout(tick, speed)
        } else {
          onDone?.()
        }
      }
    }

    tick()

    return () => {
      cancelled = true
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [start, text, speed, onDone])

  if (!start) return null

  return <span>{displayed}</span>
}
