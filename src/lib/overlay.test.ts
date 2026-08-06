import { describe, expect, it, vi } from 'vitest'
import {
  activateOverlay,
  addEscapeListener,
  addOutsideDismissListener,
  applyInert,
  lockScroll,
} from './overlay'

/**
 * Minimal fake `EventTarget`: enough of `addEventListener`/
 * `removeEventListener` to drive the listener helpers without a real DOM.
 * `dispatch` takes `unknown` (not `Event`) since tests only need to hand
 * back plain `{ key: ... }`/`{ target: ... }` shapes, not construct real
 * (unavailable in this Node test environment) `Event` instances.
 */
class FakeTarget {
  private listeners = new Map<string, Set<(event: Event) => void>>()

  addEventListener(type: string, listener: (event: Event) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set())
    this.listeners.get(type)!.add(listener)
  }

  removeEventListener(type: string, listener: (event: Event) => void) {
    this.listeners.get(type)?.delete(listener)
  }

  dispatch(type: string, event: unknown) {
    for (const listener of this.listeners.get(type) ?? []) listener(event as Event)
  }

  listenerCount(type: string) {
    return this.listeners.get(type)?.size ?? 0
  }
}

class FakeBoundary extends FakeTarget {
  private containedNodes = new Set<unknown>()

  contains(node: unknown) {
    return this.containedNodes.has(node)
  }

  addContained(node: unknown) {
    this.containedNodes.add(node)
  }
}

describe('lockScroll', () => {
  it('sets overflow to hidden and restores the previous value on release', () => {
    const root = { style: { overflow: 'visible' } }
    const release = lockScroll(root)
    expect(root.style.overflow).toBe('hidden')

    release()
    expect(root.style.overflow).toBe('visible')
  })

  it('is reference-counted so two overlays locking the same root cannot clobber each other', () => {
    const root = { style: { overflow: 'auto' } }

    const releaseFirst = lockScroll(root)
    const releaseSecond = lockScroll(root)
    expect(root.style.overflow).toBe('hidden')

    // Releasing the first lock must NOT unlock scroll while the second
    // overlay is still open -- this is the "cannot clobber" guarantee.
    releaseFirst()
    expect(root.style.overflow).toBe('hidden')

    releaseSecond()
    expect(root.style.overflow).toBe('auto')
  })

  it('releasing the same lock twice is a no-op', () => {
    const root = { style: { overflow: 'auto' } }
    const release = lockScroll(root)
    release()
    release()
    expect(root.style.overflow).toBe('auto')
  })

  it('unlocks correctly regardless of release order', () => {
    const root = { style: { overflow: 'scroll' } }
    const releaseFirst = lockScroll(root)
    const releaseSecond = lockScroll(root)

    releaseSecond()
    expect(root.style.overflow).toBe('hidden')
    releaseFirst()
    expect(root.style.overflow).toBe('scroll')
  })
})

describe('applyInert', () => {
  it('marks every element inert and restores false on release', () => {
    const elements = [{ inert: false }, { inert: false }]
    const release = applyInert(elements)
    expect(elements.every((el) => el.inert)).toBe(true)

    release()
    expect(elements.every((el) => el.inert)).toBe(false)
  })

  it('restores each element to its actual prior value, not a blanket false', () => {
    const alreadyInert = { inert: true }
    const notInert = { inert: false }
    const release = applyInert([alreadyInert, notInert])

    release()
    expect(alreadyInert.inert).toBe(true)
    expect(notInert.inert).toBe(false)
  })

  it('release is idempotent', () => {
    const el = { inert: false }
    const release = applyInert([el])
    release()
    el.inert = true // simulate something else legitimately re-inerting it
    release()
    expect(el.inert).toBe(true)
  })
})

describe('addEscapeListener', () => {
  it('calls onEscape only for the Escape key', () => {
    const target = new FakeTarget()
    const onEscape = vi.fn()
    addEscapeListener(target, onEscape)

    target.dispatch('keydown', { key: 'Enter' })
    expect(onEscape).not.toHaveBeenCalled()

    target.dispatch('keydown', { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('stops listening after cleanup', () => {
    const target = new FakeTarget()
    const onEscape = vi.fn()
    const cleanup = addEscapeListener(target, onEscape)
    cleanup()

    target.dispatch('keydown', { key: 'Escape' })
    expect(onEscape).not.toHaveBeenCalled()
    expect(target.listenerCount('keydown')).toBe(0)
  })
})

describe('addOutsideDismissListener', () => {
  it('dismisses on a mousedown outside the boundary, not inside it', () => {
    const doc = new FakeTarget()
    const boundary = new FakeBoundary()
    const insideNode = {}
    boundary.addContained(insideNode)
    const onDismiss = vi.fn()

    addOutsideDismissListener(doc, boundary, onDismiss)

    doc.dispatch('mousedown', { target: insideNode })
    expect(onDismiss).not.toHaveBeenCalled()

    doc.dispatch('mousedown', { target: {} })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('dismisses on focus-out only when the next focus target is outside the boundary', () => {
    const doc = new FakeTarget()
    const boundary = new FakeBoundary()
    const insideNode = {}
    boundary.addContained(insideNode)
    const onDismiss = vi.fn()

    addOutsideDismissListener(doc, boundary, onDismiss)

    boundary.dispatch('focusout', { relatedTarget: insideNode })
    expect(onDismiss).not.toHaveBeenCalled()

    boundary.dispatch('focusout', { relatedTarget: null })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('stops listening after cleanup', () => {
    const doc = new FakeTarget()
    const boundary = new FakeBoundary()
    const onDismiss = vi.fn()
    const cleanup = addOutsideDismissListener(doc, boundary, onDismiss)
    cleanup()

    doc.dispatch('mousedown', { target: {} })
    expect(onDismiss).not.toHaveBeenCalled()
  })
})

describe('activateOverlay', () => {
  function setup() {
    const doc = new FakeTarget()
    const root = { style: { overflow: 'visible' } }
    const background = [{ inert: false }, { inert: false }]
    const initialFocus = { focus: vi.fn() }
    const trigger = { focus: vi.fn() }
    const onDismiss = vi.fn()

    return { doc, root, background, initialFocus, trigger, onDismiss }
  }

  it('locks scroll, inerts the background, and moves focus in on activation', () => {
    const { doc, root, background, initialFocus, onDismiss } = setup()

    const deactivate = activateOverlay(
      { document: doc },
      { onDismiss, background, lockScrollRoot: root, initialFocus },
    )

    expect(root.style.overflow).toBe('hidden')
    expect(background.every((el) => el.inert)).toBe(true)
    expect(initialFocus.focus).toHaveBeenCalledTimes(1)

    // `lockScroll` is a module-level singleton (that's the whole point --
    // see the "cannot clobber" test below) so every test that locks must
    // also release, or it leaks into whichever test runs next.
    deactivate()
  })

  it('deactivate undoes the scroll lock and background inert', () => {
    const { doc, root, background, onDismiss } = setup()

    const deactivate = activateOverlay({ document: doc }, { onDismiss, background, lockScrollRoot: root })
    deactivate()

    expect(root.style.overflow).toBe('visible')
    expect(background.every((el) => el.inert)).toBe(false)
  })

  it('Escape calls onDismiss and restores focus to the configured target', () => {
    const { doc, onDismiss, trigger } = setup()

    activateOverlay(
      { document: doc },
      { onDismiss, dismissOnEscape: true, restoreFocusOnEscape: trigger },
    )

    doc.dispatch('keydown', { key: 'Escape' })
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(trigger.focus).toHaveBeenCalledTimes(1)
  })

  it('outside dismissal calls onDismiss but never restores focus', () => {
    const doc = new FakeTarget()
    const boundary = new FakeBoundary()
    const onDismiss = vi.fn()
    const trigger = { focus: vi.fn() }

    activateOverlay(
      { document: doc },
      { onDismiss, outsideDismissBoundary: boundary, restoreFocusOnEscape: trigger },
    )

    doc.dispatch('mousedown', { target: {} })
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(trigger.focus).not.toHaveBeenCalled()
  })

  it('deactivate removes all listeners so a later Escape or outside click is a no-op', () => {
    const { doc, onDismiss, trigger } = setup()
    const boundary = new FakeBoundary()

    const deactivate = activateOverlay(
      { document: doc },
      { onDismiss, dismissOnEscape: true, restoreFocusOnEscape: trigger, outsideDismissBoundary: boundary },
    )
    deactivate()

    doc.dispatch('keydown', { key: 'Escape' })
    doc.dispatch('mousedown', { target: {} })
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('two overlays locking the same root cannot clobber each other via activateOverlay', () => {
    const doc = new FakeTarget()
    const root = { style: { overflow: 'visible' } }
    const onDismissA = vi.fn()
    const onDismissB = vi.fn()

    const deactivateA = activateOverlay({ document: doc }, { onDismiss: onDismissA, lockScrollRoot: root })
    const deactivateB = activateOverlay({ document: doc }, { onDismiss: onDismissB, lockScrollRoot: root })

    deactivateA()
    expect(root.style.overflow).toBe('hidden')

    deactivateB()
    expect(root.style.overflow).toBe('visible')
  })
})
