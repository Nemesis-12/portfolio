/**
 * Single owner of overlay behaviour (#355): scroll locking, background
 * `inert`, and focus restoration, plus the Escape/outside-click/focus-out
 * dismissal wiring both `MobileNav` and `ThemePicker` used to hand-roll
 * separately.
 *
 * Before this module existed, `MobileNav` located what to mark `inert` by
 * querying the DOM for markup owned by other components -- the progress
 * bar by its position inside the header (`header > [role="progressbar"]`),
 * the skip link by its `href` (`a[href="#main-content"]`), and `<main>` by
 * its id (`#main-content`). Reordering or renaming any of that broke the
 * accessibility behaviour silently -- no type error, no test failure, no
 * runtime warning. `ThemePicker` separately hand-rolled its own Escape /
 * outside-click / focus-out dismissal with no shared owner of the global
 * state (`document` listeners, `documentElement.style.overflow`) both
 * overlays touch.
 *
 * Everything here is plain, framework-agnostic functions operating on
 * whatever minimal element-shaped objects are passed in -- no DOM query, no
 * selector, no element id. `background` (what counts as "behind" this
 * overlay) is always a list the *caller* hands in; this module never goes
 * looking for it. `src/lib/useOverlay.ts` is the thin React-effect wrapper
 * around `activateOverlay`; this file is what's actually under test (the
 * test environment is Node, not a browser, so everything below is written
 * against small structural types rather than real DOM classes).
 */

/** Anything whose scroll can be locked: just enough of `HTMLElement`. */
export interface ScrollLockable {
  style: { overflow: string }
}

/** Anything that can be marked `inert` while an overlay is open. */
export interface Inertable {
  inert: boolean
}

/** Anything that can receive focus. */
export interface Focusable {
  focus(): void
}

/** Minimal `EventTarget`-shaped surface this module needs for `document`. */
export interface ListenerTarget {
  addEventListener(type: string, listener: (event: Event) => void): void
  removeEventListener(type: string, listener: (event: Event) => void): void
}

/** The boundary an outside-click/focus-out dismissal is measured against. */
export interface DismissBoundary extends ListenerTarget {
  contains(node: unknown): boolean
}

let scrollLockCount = 0
let scrollLockRoot: ScrollLockable | null = null
let scrollLockPreviousOverflow = ''

/**
 * Locks `root`'s scroll (`style.overflow = 'hidden'`) and returns a release
 * function. Reference-counted at module scope so two overlays locking the
 * same root can't clobber each other: the second lock is a no-op beyond
 * incrementing the count, and `style.overflow` is only restored once every
 * lock has been released. This is what makes "two overlays cannot clobber
 * each other's scroll-lock state" true regardless of open/close order.
 *
 * The reference count is keyed to a single root at a time (`scrollLockRoot`),
 * not per-root -- there is currently exactly one scroll-lockable root in
 * this app (`document.documentElement`), so this has never mattered in
 * practice. If a second, *different* root is locked while the first is
 * still held, silently doing nothing to it (while still handing back a
 * release function that looks like it worked) is exactly the class of
 * silent failure this module exists to remove, so that case is refused and
 * surfaced loudly instead of attempted.
 */
export function lockScroll(root: ScrollLockable): () => void {
  if (scrollLockCount > 0 && scrollLockRoot !== root) {
    // Deliberately surfaced: locking a second, different root while one is
    // already held would otherwise be a silent no-op that hands back a
    // release function which does nothing visible.
    console.error(
      '[lockScroll] A different root is already scroll-locked; locking two different roots at once is not supported. This root will not be locked.',
    )
    return () => {}
  }

  if (scrollLockCount === 0) {
    scrollLockRoot = root
    scrollLockPreviousOverflow = root.style.overflow
    root.style.overflow = 'hidden'
  }
  scrollLockCount += 1

  let released = false
  return () => {
    if (released) return
    released = true
    scrollLockCount -= 1
    if (scrollLockCount <= 0) {
      scrollLockCount = 0
      if (scrollLockRoot) scrollLockRoot.style.overflow = scrollLockPreviousOverflow
      scrollLockRoot = null
      scrollLockPreviousOverflow = ''
    }
  }
}

/**
 * Marks every element in `elements` `inert`, remembering each one's prior
 * `inert` value so the release function restores it exactly (rather than
 * assuming `false`) even if something was already inert for an unrelated
 * reason.
 */
export function applyInert(elements: Iterable<Inertable>): () => void {
  const previous: Array<[Inertable, boolean]> = []
  for (const element of elements) {
    previous.push([element, element.inert])
    element.inert = true
  }

  let released = false
  return () => {
    if (released) return
    released = true
    for (const [element, wasInert] of previous) element.inert = wasInert
  }
}

/** Calls `onEscape` for every `Escape` keydown on `target`; returns cleanup. */
export function addEscapeListener(target: ListenerTarget, onEscape: () => void): () => void {
  const onKeyDown = (event: Event) => {
    if ((event as KeyboardEvent).key === 'Escape') onEscape()
  }
  target.addEventListener('keydown', onKeyDown)
  return () => target.removeEventListener('keydown', onKeyDown)
}

/**
 * Calls `onDismiss` when a pointerdown or focus-out lands outside
 * `boundary`. Mirrors `ThemePicker`'s former hand-rolled outside-click/
 * focus-out pair exactly (mousedown on `doc`, focusout on `boundary`
 * itself), just owned in one shared place now.
 */
export function addOutsideDismissListener(
  doc: ListenerTarget,
  boundary: DismissBoundary,
  onDismiss: () => void,
): () => void {
  const onPointerDown = (event: Event) => {
    if (!boundary.contains((event as MouseEvent).target)) onDismiss()
  }
  const onFocusOut = (event: Event) => {
    const next = (event as FocusEvent).relatedTarget
    if (!next || !boundary.contains(next)) onDismiss()
  }

  doc.addEventListener('mousedown', onPointerDown)
  boundary.addEventListener('focusout', onFocusOut)
  return () => {
    doc.removeEventListener('mousedown', onPointerDown)
    boundary.removeEventListener('focusout', onFocusOut)
  }
}

/** Where `activateOverlay` gets `document` from -- injected, never imported. */
export interface OverlayEnv {
  document: ListenerTarget
}

export interface OverlayConfig {
  /** Called to close the overlay, from either dismissal path below. */
  onDismiss: () => void
  /**
   * Elements to mark `inert` while the overlay is open -- declared by the
   * caller (ultimately the app shell), never discovered by query. Omit for
   * overlays with no full-page background sweep (e.g. a small dropdown).
   */
  background?: Iterable<Inertable>
  /** Locks this root's scroll for as long as the overlay is open. */
  lockScrollRoot?: ScrollLockable
  /** Focused once, when the overlay activates. */
  initialFocus?: Focusable | null
  /** Closes the overlay on `Escape` when true. */
  dismissOnEscape?: boolean
  /**
   * Focused after an Escape-triggered dismissal (only). Outside-click/
   * focus-out dismissal never restores focus -- see `outsideDismissBoundary`.
   */
  restoreFocusOnEscape?: Focusable | null
  /**
   * If set, a pointerdown or focus-out landing outside this boundary
   * closes the overlay. Deliberately does NOT restore focus (matching the
   * prior per-component behaviour): the user's click or Tab already moved
   * focus somewhere else, so pulling it back would fight that.
   */
  outsideDismissBoundary?: DismissBoundary | null
}

/**
 * Activates one overlay: locks scroll, inerts the background, moves focus
 * in, and wires whichever dismissal paths are configured. Returns a single
 * deactivate function that undoes all of it, in reverse order.
 */
export function activateOverlay(env: OverlayEnv, config: OverlayConfig): () => void {
  const cleanups: Array<() => void> = []

  if (config.lockScrollRoot) cleanups.push(lockScroll(config.lockScrollRoot))
  if (config.background) cleanups.push(applyInert(config.background))
  config.initialFocus?.focus()

  if (config.dismissOnEscape) {
    cleanups.push(
      addEscapeListener(env.document, () => {
        config.onDismiss()
        config.restoreFocusOnEscape?.focus()
      }),
    )
  }

  if (config.outsideDismissBoundary) {
    cleanups.push(addOutsideDismissListener(env.document, config.outsideDismissBoundary, config.onDismiss))
  }

  let released = false
  return () => {
    if (released) return
    released = true
    for (const cleanup of cleanups.reverse()) cleanup()
  }
}
