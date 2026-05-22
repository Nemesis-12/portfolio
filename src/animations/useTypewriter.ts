import { useState, useEffect, useRef } from 'react'

export function useTypewriter(
  active: boolean,
  lines: string[],
  speed = 25,
  onDone?: () => void
) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([])
  const stateRef = useRef({ lineIndex: 0, charIndex: 0, done: false })
  const timerRef = useRef<number | null>(null)
  const onDoneRef = useRef(onDone)
  const linesRef = useRef(lines)
  const linesKey = JSON.stringify(lines)
  const prevLinesKeyRef = useRef(linesKey)

  linesRef.current = lines

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const linesChanged = linesKey !== prevLinesKeyRef.current

    if (linesChanged) {
      prevLinesKeyRef.current = linesKey
      stateRef.current = { lineIndex: 0, charIndex: 0, done: false }
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

    const typeNextChar = () => {
      const { lineIndex, charIndex } = stateRef.current
      const lines = linesRef.current

      if (lineIndex >= lines.length) {
        stateRef.current.done = true
        onDoneRef.current?.()
        return
      }

      const currentLine = lines[lineIndex]

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
  }, [active, linesKey, speed])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return displayedLines
}
