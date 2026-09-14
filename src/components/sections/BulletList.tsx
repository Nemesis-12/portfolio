import { cn } from '@/lib/cn'

export interface BulletListProps {
  /** The text for each row. Each string must be unique -- it doubles as the
   * React key since these are static, sourced-from-data lists (no ids). */
  readonly items: readonly string[]
  /** The marker glyph shown before each row's text (e.g. `→` or `+`). */
  readonly marker: string
  /** Class applied to the marker span only, so callers can give it their
   * own colour (`text-accent`, `text-dim`, ...) without affecting the row
   * text. */
  readonly markerClassName: string
  /** Classes for the outer `<ul>` -- typography, gap, and any divider the
   * caller's list needs (e.g. the timeline's top border). */
  readonly className?: string
}

/**
 * Marker-and-text row list shared by the Leviathan bullets
 * (`ProjectsFeatured.tsx`) and the timeline entry bullets
 * (`EducationExperience.tsx`) -- issue #391. The two lists differed only in
 * the marker glyph, its colour, and small gap values; this component takes
 * the glyph and colour as parameters and renders proper `<ul>/<li>`
 * semantics for both (the timeline previously used plain `<div>`s).
 *
 * The container gap uses `--space-fit-3xs` (the Leviathan value). Issue
 * #377 removed the near-duplicate `--space-fit-3xs-tight` token that the
 * timeline entry bullets used to carry separately, since the two differed
 * by about a pixel across the whole viewport range. The row's internal
 * marker-to-text gap converges the same way, onto the Leviathan value
 * (12px).
 */
export function BulletList({ items, marker, markerClassName, className }: BulletListProps) {
  return (
    <ul className={cn('flex flex-col gap-[var(--space-fit-3xs)]', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-[12px]">
          <span aria-hidden="true" className={markerClassName}>
            {marker}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}
