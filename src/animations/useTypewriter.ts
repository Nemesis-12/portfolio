import { useState, useEffect, useRef } from 'react'

interface UseTypewriterOptions {
  mode?: 'character' | 'line' | 'parallel'
  restartOnActivate?: boolean
}

export function useTypewriter(
  active: boolean,
  lines: string[],
  speed = 25,
  onDone?: () => void,
  options: UseTypewriterOptions = {},
) {
  const { mode = 'character', restartOnActivate = false } = options
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const stateRef = useRef({ lineIndex: 0, charIndex: 0, done: false })
  const charIndicesRef = useRef<number[]>([])
  const timerRef = useRef<number | null>(null)
  const onDoneRef = useRef(onDone)
  const linesRef = useRef(lines)
  const linesKey = JSON.stringify(lines)
  const prevLinesKeyRef = useRef(linesKey)
  const prevActiveRef = useRef(active)

  linesRef.current = lines

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
      setDisplayedLines([])
    } else if (activated && restartOnActivate) {
      stateRef.current = { lineIndex: 0, charIndex: 0, done: false }
      charIndicesRef.current = []
      setDisplayedLines([])
    }

    if (!active) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
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

    if (stateRef.current.done) return

    if (mode === 'parallel') {
      if (charIndicesRef.current.length === 0) {
        charIndicesRef.current = currentLines.map(() => 0)
      }

      const typeNextTick = () => {
        const lines = linesRef.current
        const indices = charIndicesRef.current
        let allDone = true
        const nextLines = lines.map((line, lineIndex) => {
          const charIndex = indices[lineIndex] ?? 0
          if (charIndex < line.length) {
            indices[lineIndex] = charIndex + 1
            allDone = false
            return line.slice(0, charIndex + 1)
          }
          return line
        })

        setDisplayedLines(nextLines)

        if (!allDone) {
          timerRef.current = window.setTimeout(typeNextTick, speed)
        } else {
          stateRef.current.done = true
          onDoneRef.current?.()
        }
      }

      timerRef.current = window.setTimeout(typeNextTick, speed)

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }
    }

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
    }
  }, [])

  return displayedLines
}
