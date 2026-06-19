import { useState, useEffect, useRef } from 'react'

interface UseTypewriterOptions {
  mode?: 'character' | 'line' | 'parallel'
  restartOnActivate?: boolean
  delays?: number[]
}

export function useTypewriter(
  active: boolean,
  lines: string[],
  speed = 25,
  onDone?: () => void,
  options: UseTypewriterOptions = {},
) {
  const { mode = 'character', restartOnActivate = false, delays } = options
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const stateRef = useRef({ lineIndex: 0, charIndex: 0, done: false })
  const charIndicesRef = useRef<number[]>([])
  const timerRef = useRef<number | null>(null)
  const parallelTimersRef = useRef<number[]>([])
  const parallelDoneCountRef = useRef(0)
  const parallelDoneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  const linesRef = useRef(lines)
  const delaysRef = useRef(delays)
  const linesKey = JSON.stringify(lines)
  const prevLinesKeyRef = useRef(linesKey)
  const prevActiveRef = useRef(active)

  linesRef.current = lines
  delaysRef.current = delays

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const linesChanged = linesKey !== prevLinesKeyRef.current
    const activated = active && !prevActiveRef.current
    prevActiveRef.current = active

    if (linesChanged) {
      prevLinesKeyRef.current = linesKey
      stateRef.current = { lineIndex: 0, charIndex: 0, done: false }
      charIndicesRef.current = []
      parallelDoneCountRef.current = 0
      parallelDoneRef.current = false
      setDisplayedLines([])
    } else if (activated && restartOnActivate) {
      stateRef.current = { lineIndex: 0, charIndex: 0, done: false }
      charIndicesRef.current = []
      parallelDoneCountRef.current = 0
      parallelDoneRef.current = false
      setDisplayedLines([])
    }

    if (!active) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (parallelTimersRef.current.length > 0) {
        parallelTimersRef.current.forEach(id => clearTimeout(id))
        parallelTimersRef.current = []
      }
      return
    }

    const currentLines = linesRef.current

    if (currentLines.length === 0) {
      if (!stateRef.current.done) {
        stateRef.current.done = true
        onDoneRef.current?.()
      }
      return
    }

    if (mode === 'parallel') {
      if (parallelDoneRef.current) return

      // Each line gets its own independent timer chain: wait its own start
      // delay, then tick character-by-character at `speed` ms/char,
      // completely independent of every other line's timer. This mirrors
      // the design contract's Typewriter component (ideas/Portfolio.html
      // lines 610-631), where lines start near-simultaneously (small ms
      // stagger) but each types on its own clock — not lockstep-parallel.
      const lineTimers: number[] = []
      const totalLines = currentLines.length

      currentLines.forEach((line, lineIndex) => {
        const lineDelay = delaysRef.current?.[lineIndex] ?? 0

        const tick = (charIndex: number) => {
          const latestLine = linesRef.current[lineIndex] ?? line
          const nextIndex = charIndex + 1
          const slice = latestLine.slice(0, nextIndex)

          setDisplayedLines(prev => {
            const newLines = [...prev]
            newLines[lineIndex] = slice
            return newLines
          })

          if (nextIndex < latestLine.length) {
            lineTimers[lineIndex] = window.setTimeout(() => tick(nextIndex), speed)
          } else {
            parallelDoneCountRef.current += 1
            if (parallelDoneCountRef.current >= totalLines) {
              parallelDoneRef.current = true
              stateRef.current.done = true
              onDoneRef.current?.()
            }
          }
        }

        if (line.length === 0) {
          setDisplayedLines(prev => {
            const newLines = [...prev]
            newLines[lineIndex] = ''
            return newLines
          })
          parallelDoneCountRef.current += 1
          if (parallelDoneCountRef.current >= totalLines) {
            parallelDoneRef.current = true
            stateRef.current.done = true
            onDoneRef.current?.()
          }
          return
        }

        lineTimers[lineIndex] = window.setTimeout(() => tick(0), lineDelay)
      })

      parallelTimersRef.current = lineTimers

      return () => {
        lineTimers.forEach(id => clearTimeout(id))
        parallelTimersRef.current = []
      }
    }

    if (stateRef.current.done) return

    const typeNextChar = () => {
      const { lineIndex, charIndex } = stateRef.current
      const lines = linesRef.current

      if (lineIndex >= lines.length) {
        stateRef.current.done = true
        onDoneRef.current?.()
        return
      }

      const currentLine = lines[lineIndex]

      if (mode === 'line') {
        setDisplayedLines(prev => {
          const newLines = [...prev]
          newLines[lineIndex] = currentLine
          return newLines
        })

        stateRef.current.lineIndex = lineIndex + 1
        stateRef.current.charIndex = 0

        if (stateRef.current.lineIndex < linesRef.current.length) {
          timerRef.current = window.setTimeout(typeNextChar, speed)
        } else {
          stateRef.current.done = true
          onDoneRef.current?.()
        }
        return
      }

      if (charIndex < currentLine.length) {
        setDisplayedLines(prev => {
          const newLines = [...prev]
          if (!newLines[lineIndex]) newLines[lineIndex] = ''
          newLines[lineIndex] = currentLine.slice(0, charIndex + 1)
          return newLines
        })

        stateRef.current.charIndex = charIndex + 1
        timerRef.current = window.setTimeout(typeNextChar, speed)
      } else {
        stateRef.current.lineIndex = lineIndex + 1
        stateRef.current.charIndex = 0

        if (stateRef.current.lineIndex < linesRef.current.length) {
          setDisplayedLines(prev => {
            const newLines = [...prev]
            newLines[stateRef.current.lineIndex] = ''
            return newLines
          })
          timerRef.current = window.setTimeout(typeNextChar, speed)
        } else {
          stateRef.current.done = true
          onDoneRef.current?.()
        }
      }
    }

    timerRef.current = window.setTimeout(typeNextChar, speed)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [active, linesKey, mode, restartOnActivate, speed])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (parallelTimersRef.current.length > 0) {
        parallelTimersRef.current.forEach(id => clearTimeout(id))
        parallelTimersRef.current = []
      }
    }
  }, [])

  return displayedLines
}
