import { forwardRef, useCallback, useRef, type ElementType, type ReactNode } from 'react'
import { useCardDeckDepth } from '../hooks/useCardDeckDepth'

interface Props {
  id: string
  children: ReactNode
  className?: string
  as?: 'section' | 'footer'
}

export const StickySection = forwardRef<HTMLElement, Props>(function StickySection(
  { id, children, className = '', as = 'section' },
  forwardedRef
) {
  const sectionRef = useRef<HTMLElement>(null)
  const Component = as as ElementType
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node

      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
        return
      }

      if (forwardedRef) {
        forwardedRef.current = node
      }
    },
    [forwardedRef]
  )

  useCardDeckDepth(sectionRef)

  return (
    <Component
      ref={setSectionRef}
      id={id}
      data-sticky-section="true"
      className={`sticky top-0 min-h-screen origin-center transform-gpu ${className}`.trim()}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </Component>
  )
})
