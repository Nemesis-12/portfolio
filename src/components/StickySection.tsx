import { forwardRef, useCallback, useRef, type ElementType, type ReactNode } from 'react'

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

  return (
    <Component
      ref={setSectionRef}
      id={id}
      className={`min-h-screen ${className}`.trim()}
    >
      {children}
    </Component>
  )
})
