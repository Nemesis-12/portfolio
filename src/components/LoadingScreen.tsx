import { useEffect, useState } from 'react'
import {
  BOOT_DURATION,
  FADE_OUT_DURATION,
  MESSAGE_INTERVAL,
  STATUS_MESSAGES,
} from './LoadingScreen.constants'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((index) => Math.min(index + 1, STATUS_MESSAGES.length - 1))
    }, MESSAGE_INTERVAL)

    const bootTimer = setTimeout(() => {
      clearInterval(interval)
      setExiting(true)
    }, BOOT_DURATION)

    return () => {
      clearInterval(interval)
      clearTimeout(bootTimer)
    }
  }, [])

  useEffect(() => {
    if (!exiting) {
      return
    }

    const fadeTimer = setTimeout(onComplete, FADE_OUT_DURATION)
    return () => clearTimeout(fadeTimer)
  }, [exiting, onComplete])

  return (
    <div id="ls" className={exiting ? 'out' : undefined}>
      <div className="ls-inner">
        <div className="ls-sys">SYSTEM_INIT...</div>
        <div className="ls-name">
          FARHAN
          <br />
          MOHAMMED
        </div>
        <div className="ls-track">
          <div className="ls-fill" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-label="Loading progress" />
        </div>
        <div className="ls-msg">{STATUS_MESSAGES[messageIndex]}</div>
      </div>
    </div>
  )
}
