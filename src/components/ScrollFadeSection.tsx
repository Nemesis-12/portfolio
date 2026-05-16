import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

/** Props for the ScrollFadeSection component. */
interface Props {
  /** Unique identifier for the section element. */
  id: string
  /** Child content to render inside the section. */
  children: ReactNode
  /** Optional CSS classes to apply to the section. */
  className?: string
}

/**
 * A section that fades in and slides up when scrolled into view.
 * Uses Framer Motion's useInView to trigger opacity and translateY
 * animations with a 0.6s easeOut transition.
 */
export function ScrollFadeSection({ id, children, className = '' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { margin: '-10% 0px -10% 0px', amount: 0.1 })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 24 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  )
}