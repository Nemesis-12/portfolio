import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { activateOverlay } from './overlay'

/**
 * React wrapper around `activateOverlay` (#355). This file is deliberately
 * thin and untested directly -- `overlay.ts` is where the actual scroll
 * lock/inert/dismissal logic lives and is covered by tests; this hook's
 * only job is resolving React refs to real elements at effect time (after
 * commit, so a ref used for `initialFocus` on the same render that mounts
 * the element it points to is never stale) and injecting the real
 * `document`.
 *
 * `active` is the only reactive dependency: the rest of `config` is read
 * through a ref updated every render (`configRef`), the same "latest ref"
 * pattern used to avoid re-running an effect just because an inline object
 * or closure was recreated. The effect itself only needs to run once per
 * open/close transition, not on every render while open.
 */
export interface UseOverlayConfig {
  /** Called to close the overlay (typically `() => setOpen(false)`). */
  onDismiss: () => void
  /**
   * Refs to elements to mark `inert` while open, resolved to their
   * `.current` value at effect time rather than at render time -- refs may
   * not be mounted yet on the render that flips `active` to true.
   */
  backgroundRefs?: RefObject<HTMLElement | null>[]
  /** Locks this root's scroll for as long as the overlay is open. */
  lockScrollRoot?: { style: { overflow: string } }
  /** Focused once, when the overlay activates. */
  initialFocus?: RefObject<Pick<HTMLElement, 'focus'> | null>
  /** Closes the overlay on `Escape` when true. */
  dismissOnEscape?: boolean
  /** Focused after an Escape-triggered dismissal (only). */
  restoreFocusOnEscape?: RefObject<Pick<HTMLElement, 'focus'> | null>
  /** If set, a pointerdown/focus-out outside this element closes the overlay. */
  outsideDismissBoundary?: RefObject<(HTMLElement & { contains(node: unknown): boolean }) | null>
}

/**
 * Activates the overlay described by `config` for as long as `active` is
 * true, and deactivates it (releasing the scroll lock, lifting `inert`,
 * removing listeners) the moment `active` goes false or the component
 * unmounts.
 */
export function useOverlay(active: boolean, config: UseOverlayConfig): void {
  const configRef = useRef(config)

  // Keeps `configRef` current every render without reading or writing it
  // during render itself (both are effects, running after commit) -- this
  // one has no dependency array, so it runs on every commit, and always
  // before the `[active]` effect below since effects run in declaration
  // order within a component.
  useEffect(() => {
    configRef.current = config
  })

  useEffect(() => {
    if (!active) return

    const current = configRef.current
    const background = current.backgroundRefs
      ?.map((ref) => ref.current)
      .filter((element): element is HTMLElement => element !== null)

    return activateOverlay(
      { document },
      {
        onDismiss: current.onDismiss,
        background,
        lockScrollRoot: current.lockScrollRoot,
        initialFocus: current.initialFocus?.current ?? null,
        dismissOnEscape: current.dismissOnEscape,
        restoreFocusOnEscape: current.restoreFocusOnEscape?.current ?? null,
        outsideDismissBoundary: current.outsideDismissBoundary?.current ?? null,
      },
    )
  }, [active])
}
