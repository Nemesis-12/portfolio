import { useState, useEffect, useRef } from 'react'

interface RotatingRoleProps {
  roles: string[]
  active: boolean
  typeSpeed?: number
  eraseSpeed?: number
  holdMs?: number
}

type Phase = 'idle' | 'typing' | 'holding' | 'erasing'

export function RotatingRole({
  roles,
  active,
  typeSpeed = 40,
  eraseSpeed = 30,
  holdMs = 2000,
}: RotatingRoleProps) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const stateRef = useRef({ roleIndex: 0, charIndex: 0, phase: 'idle' as Phase })
  const timerRef = useRef<number | null>(null)
  const cursorTimerRef = useRef<number | null>(null)

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (cursorTimerRef.current) {
      clearInterval(cursorTimerRef.current)
      cursorTimerRef.current = null
    }
  }

  useEffect(() => {
    if (!active || roles.length === 0) {
      clearTimers()
      setDisplayed('')
      setShowCursor(true)
      stateRef.current = { roleIndex: 0, charIndex: 0, phase: 'idle' }
      return
    }

    if (stateRef.current.phase === 'idle') {
      stateRef.current.phase = 'typing'
    }

    cursorTimerRef.current = window.setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)

    const tick = () => {
      const { roleIndex, charIndex, phase } = stateRef.current
      const currentRole = roles[roleIndex]

      if (phase === 'typing') {
        if (charIndex < currentRole.length) {
          setDisplayed(currentRole.slice(0, charIndex + 1))
          stateRef.current.charIndex = charIndex + 1
          timerRef.current = window.setTimeout(tick, typeSpeed)
        } else {
          stateRef.current.phase = 'holding'
          timerRef.current = window.setTimeout(tick, holdMs)
        }
      } else if (phase === 'holding') {
        stateRef.current.phase = 'erasing'
        timerRef.current = window.setTimeout(tick, eraseSpeed)
      } else if (phase === 'erasing') {
        if (charIndex > 0) {
          stateRef.current.charIndex = charIndex - 1
          setDisplayed(currentRole.slice(0, charIndex - 1))
          timerRef.current = window.setTimeout(tick, eraseSpeed)
        } else {
          stateRef.current.roleIndex = (roleIndex + 1) % roles.length
          stateRef.current.charIndex = 0
          stateRef.current.phase = 'typing'
          timerRef.current = window.setTimeout(tick, typeSpeed)
        }
      }
    }

    timerRef.current = window.setTimeout(tick, typeSpeed)

    return clearTimers
  }, [active, roles, typeSpeed, eraseSpeed, holdMs])

  return (
    <div data-testid="rotating-role">
      {displayed}
      <span style={{ opacity: showCursor ? 1 : 0 }}>▍</span>
    </div>
  )
}
