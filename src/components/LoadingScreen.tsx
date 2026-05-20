import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MESSAGE_DURATION, STATUS_MESSAGES } from './LoadingScreen.constants'

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const isFinalMessage = messageIndex >= STATUS_MESSAGES.length - 1
    const timer = setTimeout(
      () => {
        if (isFinalMessage) {
          onComplete()
        } else {
          setMessageIndex((i) => i + 1)
        }
      },
      MESSAGE_DURATION,
    )
    return () => clearTimeout(timer)
  }, [messageIndex, onComplete])

  const progress = ((messageIndex + 1) / STATUS_MESSAGES.length) * 100

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-graphite"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="mb-4 font-display text-xs text-atomic-tangerine">
        SYSTEM_INIT...
      </p>
      <h1 className="mb-8 font-display text-2xl text-platinum">
        FARHAN
      </h1>
      <h2 className="-mt-6 mb-8 font-display text-2xl text-platinum">
        MOHAMMED
      </h2>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mb-4 h-0.5 w-64 overflow-hidden rounded-none bg-periwinkle/20"
      >
        <motion.div
          className="h-full bg-atomic-tangerine"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <p className="font-body text-xs text-periwinkle">
        {STATUS_MESSAGES[messageIndex]}
      </p>
    </motion.div>
  )
}
