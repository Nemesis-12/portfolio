import type { SectionMeta } from '@/data/sections'
import { cn } from '@/lib/cn'

/**
 * Shared placeholder body for a section: eyebrow, title, blurb. All sizing
 * comes from the fluid type scale in `src/styles/layout.css` -- no section
 * defines its own font size.
 *
 * Real per-section content (the Go board, the pipeline animation, the
 * skills graph, etc.) replaces this in #316-#321. This exists only so the
 * shell and layout system have something to fill each screen with now.
 */
export function SectionPlaceholder({ eyebrow, title, blurb }: SectionMeta) {
  return (
    <div className="flex max-w-3xl flex-col gap-[var(--space-sm)]">
      {eyebrow && (
        <p className={cn('text-fluid-xs font-mono tracking-[0.2em] text-dim')}>{eyebrow}</p>
      )}
      <h2 className={cn('font-display text-fluid-2xl leading-tight text-fg')}>{title}</h2>
      <p className={cn('text-fluid-base font-mono text-fg-2')}>{blurb}</p>
    </div>
  )
}
