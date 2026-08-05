import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'
import { startAnimationFrameLoop } from './animationFrameLoop'

/**
 * Minimal requestAnimationFrame/cancelAnimationFrame fake. The test
 * environment is Node (no DOM, no real rAF clock), so frames are stepped
 * explicitly via `runFrame(timestamp)` instead of relying on real time.
 */
function installFakeRaf() {
  let nextId = 1
  const callbacks = new Map<number, FrameRequestCallback>()

  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextId++
    callbacks.set(id, cb)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    callbacks.delete(id)
  })

  return {
    /** Invokes every callback currently pending, as one animation frame. */
    runFrame(timestamp: number) {
      const pending = [...callbacks.values()]
      callbacks.clear()
      for (const cb of pending) cb(timestamp)
    },
    pendingCount() {
      return callbacks.size
    },
  }
}

describe('startAnimationFrameLoop', () => {
  let raf: ReturnType<typeof installFakeRaf>

  beforeEach(() => {
    raf = installFakeRaf()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('measures elapsed time from the first frame, not from call time', () => {
    const elapsedValues: number[] = []
    startAnimationFrameLoop((elapsed) => {
      elapsedValues.push(elapsed)
    })

    raf.runFrame(1000)
    raf.runFrame(1016)
    raf.runFrame(1032)

    expect(elapsedValues).toEqual([0, 16, 32])
  })

  it('reschedules another frame after each tick by default', () => {
    startAnimationFrameLoop(() => undefined)

    expect(raf.pendingCount()).toBe(1)
    raf.runFrame(0)
    expect(raf.pendingCount()).toBe(1)
    raf.runFrame(16)
    expect(raf.pendingCount()).toBe(1)
  })

  it('stops rescheduling once onTick returns false', () => {
    let ticks = 0
    startAnimationFrameLoop((elapsed) => {
      ticks++
      return elapsed < 20
    })

    raf.runFrame(0) // elapsed 0 -> continue
    expect(raf.pendingCount()).toBe(1)
    raf.runFrame(30) // elapsed 30 -> stop
    expect(raf.pendingCount()).toBe(0)
    expect(ticks).toBe(2)
  })

  it('cancels the pending frame when the returned cancel function is called', () => {
    const cancel = startAnimationFrameLoop(() => undefined)

    expect(raf.pendingCount()).toBe(1)
    cancel()
    expect(raf.pendingCount()).toBe(0)
  })

  it('does not invoke onTick again after cancellation even if a stray frame fires', () => {
    const onTick = vi.fn()
    const cancel = startAnimationFrameLoop(onTick)
    cancel()

    // Simulate a frame that was already in flight before cancellation took
    // effect: our fake clears callbacks on cancel, so nothing should fire.
    raf.runFrame(0)

    expect(onTick).not.toHaveBeenCalled()
  })
})
