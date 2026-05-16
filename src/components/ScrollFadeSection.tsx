import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

interface Props {
  id: string
  children: ReactNode
  className?: string
}

export function ScrollFadeSection({ id, children, className = '' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { margin: '-20% 0px -20% 0px', amount: 0.3 })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0.3 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  )
}