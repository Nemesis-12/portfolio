import { forwardRef, type ElementType, type ReactNode } from 'react'

interface Props {
  id: string
  children: ReactNode
  className?: string
  as?: 'section' | 'footer'
}

export const StickySection = forwardRef<HTMLElement, Props>(function StickySection(
  { id, children, className = '', as = 'section' },
  ref,
) {
  const Component = as as ElementType

  return (
    <Component
      ref={ref}
      id={id}
      className={`min-h-screen ${className}`.trim()}
    >
      {children}
    </Component>
  )
})
