import { useEffect, useMemo, useRef, useState } from 'react'
import { HUB_LINKS, SKILL_GROUPS, SKILL_NODES } from '@/data/skills'
import { cn } from '@/lib/cn'
import {
  deriveSkillEdges,
  getEdgeVisualState,
  getNeighborIndices,
  getNodeVisualState,
  getSkillReadout,
} from '@/lib/skills/graph'
import { useFitToViewport } from '@/lib/useFitToViewport'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

/** Computed once — `SKILL_NODES`/`HUB_LINKS` are static imports, not per-render state. */
const EDGES = deriveSkillEdges(SKILL_NODES, HUB_LINKS)

/**
 * Dot fill/border per group (reference `groups` array, sample lines
 * 618-623: `bg`/`bd` as raw CSS var strings). Kept here, not in
 * `src/data/skills.ts`, the same way `AgentCluster.tsx`'s `STATE_CLASS`
 * keeps colour classes out of `agentCluster.ts` — the data module stays
 * plain content, and only the component maps it onto this codebase's
 * theme tokens (never a hardcoded colour).
 */
const GROUP_DOT_CLASSES: Record<number, { readonly bg: string; readonly border: string }> = {
  0: { bg: 'bg-fg', border: 'border-fg' }, // LANGUAGES
  1: { bg: 'bg-accent', border: 'border-accent-2' }, // ML & DATA
  2: { bg: 'bg-accent-2', border: 'border-accent-2' }, // WEB
  3: { bg: 'bg-panel-2', border: 'border-dim-2' }, // INFRA
}

/**
 * The skills section's interactive graph (issue #319): an SVG edge layer
 * plus absolutely-positioned `<button>` nodes over it, reproducing the
 * reference's panel (`ideas/sample-decoded.html` lines 467-488) with a
 * real accessibility contract the reference never had.
 *
 * --- Active-node state: one precedence rule ---
 * Hover, focus, and tap/click all drive a single `activeIndex`, resolved
 * from three independent pieces of state rather than one shared field,
 * because hover and focus must not fight each other:
 *
 *   activeIndex = focusIndex ?? hoverIndex ?? tapIndex
 *
 * Focus wins over everything: a keyboard user tabbed onto a node sees
 * that node's note regardless of where the mouse happens to be sitting.
 * Hover wins over a lingering tap: on a device with both a mouse and a
 * prior tap-selection, moving the mouse to a different node updates the
 * readout immediately instead of being stuck on the tapped one. Tap is
 * the fallback for touch input, which has no hover and, on some
 * browsers (notably iOS Safari), does not focus a tapped `<button>`
 * either — without its own `tapIndex`, a touch-only visitor could tap a
 * node and see nothing.
 *
 * --- Dismissal ---
 * A tap/click anywhere outside the panel clears `tapIndex`/`hoverIndex`
 * (`onPointerDown` on `document`, gated to only listen while something is
 * active — the same outside-dismiss shape `ThemePicker.tsx` uses for its
 * menu, via `document.addEventListener` + a containment check against a
 * ref, rather than a new pattern). `Escape` clears all three and blurs
 * the focused element, so it also dismisses a focus-revealed note.
 *
 * --- Reduced motion ---
 * `usePrefersReducedMotion()` gates only the *transition* classes (the
 * `.2s` scale/opacity animations) — the underlying scale/opacity/colour
 * values themselves still change instantly, so the note still reveals
 * and the active node still visually stands out, just without animating.
 */
export function SkillsGraph() {
  const fitRef = useFitToViewport<HTMLDivElement>()
  const panelRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const [tapIndex, setTapIndex] = useState<number | null>(null)

  const activeIndex = focusIndex ?? hoverIndex ?? tapIndex
  const neighbors = useMemo(() => getNeighborIndices(EDGES, activeIndex), [activeIndex])
  const readout = useMemo(() => getSkillReadout(SKILL_NODES, SKILL_GROUPS, activeIndex), [activeIndex])

  useEffect(() => {
    if (activeIndex === null) return

    const onPointerDown = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setTapIndex(null)
        setHoverIndex(null)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setTapIndex(null)
      setHoverIndex(null)
      setFocusIndex(null)
      ;(document.activeElement as HTMLElement | null)?.blur()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [activeIndex])

  return (
    <div
      ref={fitRef}
      data-fit=""
      className="mt-[var(--space-fit-margin-tight)] grid max-h-[760px] flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto] gap-[14px]"
    >
      <div
        ref={panelRef}
        className="relative min-h-0 border border-line-2 bg-panel px-[clamp(30px,5vw,60px)] py-[clamp(22px,3.4vh,42px)]"
      >
        <div className="relative h-full w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            {EDGES.map((edge, index) => {
              const from = SKILL_NODES[edge.from]
              const to = SKILL_NODES[edge.to]
              const { isActive } = getEdgeVisualState(edge, activeIndex)
              return (
                <line
                  key={index}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isActive ? 'var(--color-accent)' : 'var(--color-line-2)'}
                  strokeWidth={isActive ? 1.6 : 1}
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>

          {SKILL_NODES.map((node, index) => {
            const { isActive, isDimmed } = getNodeVisualState(index, activeIndex, neighbors)
            const dotClasses = GROUP_DOT_CLASSES[node.group]

            return (
              <button
                key={node.id}
                type="button"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={cn(
                  'absolute h-0 w-0 border-0 bg-transparent p-0 text-left',
                  isDimmed && 'opacity-[.28]',
                  !reducedMotion && 'transition-opacity duration-200',
                )}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex((current) => (current === index ? null : current))}
                onFocus={() => setFocusIndex(index)}
                onBlur={() => setFocusIndex((current) => (current === index ? null : current))}
                onClick={() => setTapIndex((current) => (current === index ? null : index))}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-0 top-0 block rounded-full border-2',
                    node.hub ? '-ml-[10px] -mt-[10px] h-5 w-5' : '-ml-[6px] -mt-[6px] h-3 w-3',
                    dotClasses.bg,
                    isActive ? 'border-accent-2' : dotClasses.border,
                    isActive ? 'scale-[1.35]' : 'scale-100',
                    !reducedMotion &&
                      'transition-[transform,border-color] duration-200 [transition-timing-function:cubic-bezier(.2,1.2,.4,1)]',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 -translate-x-1/2 whitespace-nowrap tracking-[0.1em]',
                    node.hub ? 'top-[16px] text-[10px]' : 'top-[12px] text-[10.5px]',
                    isActive ? 'text-fg' : 'text-dim',
                    !reducedMotion && 'transition-colors duration-200',
                  )}
                >
                  {node.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex min-h-[60px] flex-wrap items-baseline gap-[clamp(14px,2.4vw,28px)] border border-line bg-panel-2 px-[18px] py-[14px]">
        <span
          aria-live="polite"
          className={cn(
            'font-display text-[clamp(11px,1.4vw,14px)]',
            readout.isActive ? 'text-fg' : 'text-dim-2',
          )}
        >
          {readout.name}
        </span>
        <span className="text-[9.5px] tracking-[0.18em] text-accent">{readout.groupLabel}</span>
        <span className="text-[13px] text-dim [text-wrap:pretty]">{readout.note}</span>
      </div>
    </div>
  )
}
