import { useEffect, useRef, useState } from 'react'
import { GAME4_BLACK_LABEL, GAME4_CAPTION, GAME4_WHITE_LABEL } from '@/data/hero'
import { cn } from '@/lib/cn'
import { BOARD_SIZE } from '@/lib/go/board'
import {
  frameForMove,
  hasActiveCaptureFade,
  staticFinalFrame,
  type BoardFrame,
} from '@/lib/hero/goFrameModel'
import { FADE_MS, TOTAL_MOVES, frameAtElapsed } from '@/lib/hero/goTiming'
import { useReducedMotion } from '@/lib/hero/useReducedMotion'

/** `0..1` position along one axis of a 19-line grid, as a CSS percentage. */
function percentFor(index: number): string {
  return `${(index / (BOARD_SIZE - 1)) * 100}%`
}

function moveLabelFor(moveNumber: number): string {
  return `MOVE ${String(moveNumber).padStart(3, '0')}`
}

/**
 * The 19x19 board itself: pure presentation of a `BoardFrame`. Stones are
 * keyed by board position, so React reuses the same DOM node across
 * frames for a stone that is already on the board (letting the mount
 * animation fire only once) while a captured stone leaving the `stones`
 * array unmounts and lets its own exit animation (`.hero-stone-leaving`,
 * driven purely by CSS, see src/styles/hero.css) play out.
 */
function BoardGrid({ frame }: { frame: BoardFrame }) {
  return (
    <div
      className="relative aspect-square w-full border border-line-2 bg-panel p-[4.5%]"
      role="img"
      aria-label={`Go board, move ${frame.moveNumber} of ${TOTAL_MOVES}`}
    >
      <div
        className="relative h-full w-full"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(var(--line)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line)) 1px, transparent 1px)',
          backgroundSize: `calc(100% / ${BOARD_SIZE - 1}) calc(100% / ${BOARD_SIZE - 1})`,
          // The repeating gradient above only paints a line at each tile's
          // *start* edge, so it draws 18 of the 19 lines per axis (0/18
          // through 17/18) and never the one at 100%. Paint that last line
          // explicitly as an inset box-shadow on the right/bottom edges so
          // all 19 lines land, matching the same token color.
          boxShadow: 'inset -1px 0 0 0 rgb(var(--line)), inset 0 -1px 0 0 rgb(var(--line))',
        }}
      >
        {frame.move78Marker ? (
          <span
            aria-hidden="true"
            className="absolute rounded-full border-2 border-accent"
            style={{
              left: percentFor(frame.move78Marker.col),
              top: percentFor(frame.move78Marker.row),
              width: '7.2%',
              aspectRatio: '1',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ) : null}
        {frame.stones.map((stone) => (
          <span
            key={stone.key}
            aria-hidden="true"
            className={cn(
              'absolute rounded-full',
              stone.variant === 'leaving' ? 'hero-stone hero-stone-leaving' : 'hero-stone',
              stone.variant === 'move78'
                ? 'bg-accent'
                : stone.color === 'B'
                  ? 'bg-stone'
                  : 'bg-fg',
            )}
            style={{
              left: percentFor(stone.col),
              top: percentFor(stone.row),
              width: stone.variant === 'move78' ? '6.4%' : '5%',
              aspectRatio: '1',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Owns the animation timer for the hero Go board replay. Scoped to this
 * leaf component (not `Hero.tsx`) so a ~60fps frame tick re-renders only
 * this board, not the whole hero section.
 *
 * Under `prefers-reduced-motion: reduce`, no timer is started at all --
 * the final position renders once, statically, with move 78 marked. This
 * is the fix for the reference implementation's defect: zeroing every
 * animation's duration still *plays* the sequence, just instantly,
 * flashing all 180 stones on at once. Not animating in the first place is
 * the only way to honour the preference.
 */
export function GoBoardReplay() {
  const reducedMotion = useReducedMotion()
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (reducedMotion) return undefined

    startRef.current = null
    let frameId: number
    // Signature of "what would render" (move number, phase, whether a
    // capture is mid-fade) for the most recent tick that actually
    // triggered a re-render. Ticks that would produce an identical
    // signature skip `setElapsed` entirely -- see SHOULD-FIX #4: without
    // this, the hold phase alone re-renders and rebuilds the 361-cell
    // stone array ~60x/sec for ~2.6s doing nothing visible. A capture
    // fade starting or ending always changes the signature (entry rides
    // on the move-number bump that caused it; exit is caught by
    // `hasActiveCaptureFade` flipping false), so this cannot skip a frame
    // that fix #1's exit animations depend on. The 'fading' phase is
    // exempted outright because its container-opacity animation is driven
    // by JS every tick, not CSS, so it must never skip.
    let lastSignature: string | null = null

    const tick = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp
      const nextElapsed = timestamp - startRef.current
      const timing = frameAtElapsed(nextElapsed)
      const signature = `${timing.moveNumber}|${timing.phase}|${hasActiveCaptureFade(timing.loopElapsed)}`

      if (timing.phase === 'fading' || signature !== lastSignature) {
        lastSignature = signature
        setElapsed(nextElapsed)
      }

      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [reducedMotion])

  let frame: BoardFrame
  let moveNumber: number
  let containerOpacity = 1

  if (reducedMotion) {
    frame = staticFinalFrame()
    moveNumber = TOTAL_MOVES
  } else {
    const timing = frameAtElapsed(elapsed)
    frame = frameForMove(timing.moveNumber, timing.loopElapsed)
    moveNumber = timing.moveNumber
    if (timing.phase === 'fading') {
      containerOpacity = Math.max(0, 1 - timing.elapsedSinceMove / FADE_MS)
    }
  }

  return (
    <div
      className="flex min-w-0 w-full max-w-[min(100%,58vh)] flex-col gap-[var(--space-2xs)]"
      style={{ opacity: containerOpacity }}
    >
      <div className="flex items-center justify-between gap-[var(--space-xs)] text-2xs font-mono tracking-[0.14em] text-dim">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="h-[9px] w-[9px] rounded-full bg-fg" />
          {GAME4_WHITE_LABEL}
        </span>
        <span className="flex items-center gap-2">
          {GAME4_BLACK_LABEL}
          <span
            aria-hidden="true"
            className="h-[9px] w-[9px] rounded-full border border-dim-3 bg-stone"
          />
        </span>
      </div>

      <BoardGrid frame={frame} />

      <div className="flex flex-wrap items-center justify-between gap-[var(--space-xs)] text-2xs font-mono tracking-[0.16em] text-dim-3">
        <span>{GAME4_CAPTION}</span>
        <span className="text-dim">{moveLabelFor(moveNumber)}</span>
      </div>
    </div>
  )
}
