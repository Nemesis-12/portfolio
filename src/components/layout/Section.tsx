import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface SectionProps {
  id: string
  label: string
  children: ReactNode
  className?: string
}

/**
 * Shared shell for the six top-level sections.
 *
 * Fit is achieved purely by CSS (`.section-shell` in `src/styles/
 * layout.css`, driven by the fluid type scale documented there) -- there
 * is no JavaScript measuring or `zoom` fallback. Above 880px each section
 * is exactly one viewport tall and snaps; below 880px the fixed height
 * and snap both release and the section is ordinary flow content. The
 * scroll-snap-type/scroll-behavior that drive snapping live on `:root`
 * (the actual document scroll container), not on this class.
 */
export function Section({ id, label, children, className }: SectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn('section-shell', className)}
    >
      {children}
    </section>
  )
}
