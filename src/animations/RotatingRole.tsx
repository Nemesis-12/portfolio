import { useState, useEffect, useRef } from 'react'

interface RotatingRoleProps {
  roles: string[]
  active: boolean
  className?: string
  typeSpeed?: number
  eraseSpeed?: number
  holdMs?: number
  startDelay?: number
  /** Fires once after the first role has typed, held, erased, and the second role has typed. */
  onFirstCycleComplete?: () => void
}

type Phase = 'idle' | 'typing' | 'holding' | 'erasing'

export function RotatingRole({
  roles,
  active,
  className = '',
  typeSpeed = 55,
  eraseSpeed = 28,
  holdMs = 2200,
  startDelay = 300,
  onFirstCycleComplete,
}: RotatingRoleProps) {
  const [displayed, setDisplayed] = useState('')
  const stateRef = useRef({ roleIndex: 0, charIndex: 0, phase: 'idle' as Phase })
  const timerRef = useRef<number | null>(null)
  const startTimerRef = useRef<number | null>(null)
  const onFirstCycleCompleteRef = useRef(onFirstCycleComplete)
  const hasCompletedFirstCycleRef = useRef(false)
  onFirstCycleCompleteRef.current = onFirstCycleComplete

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current)
      startTimerRef.current = null
    }
  }

  useEffect(() => {
    if (!active || roles.length === 0) {
      clearTimers()
      setDisplayed('')
      stateRef.current = { roleIndex: 0, charIndex: 0, phase: 'idle' }
      hasCompletedFirstCycleRef.current = false
      return
    }

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
          if (roleIndex > 0 && !hasCompletedFirstCycleRef.current) {
            hasCompletedFirstCycleRef.current = true
            onFirstCycleCompleteRef.current?.()
          }
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

    if (stateRef.current.phase === 'idle') {
      startTimerRef.current = window.setTimeout(() => {
        startTimerRef.current = null
        stateRef.current.phase = 'typing'
        tick()
      }, startDelay)
    } else {
      timerRef.current = window.setTimeout(tick, typeSpeed)
    }

    return clearTimers
  }, [active, roles, typeSpeed, eraseSpeed, holdMs, startDelay])

  return (
    <div data-testid="rotating-role" className={className}>
      {displayed}
      <span className="cursor cursor-peri" />
    </div>
  )
}
