import { useEffect, useId, useRef, useState } from 'react'
import { navItems } from '@/data/nav'
import { cn } from '@/lib/cn'

/**
 * Mobile hamburger nav (#314).
 *
 * The design reference (`ideas/Portfolio.html`) has no mobile nav at all --
 * below the 880px `panel:` breakpoint it would just cram all four links,
 * the theme picker, and the clock into the header, which stops being
 * usable well before 375px. This is new work, not a port: the header's
 * inline `<nav>` (see `Header.tsx`) is hidden below the breakpoint and this
 * component's trigger button takes its place, opening a full-screen list
 * of the same `navItems` the desktop nav renders.
 *
 * Interaction contract, modelled on `ThemePicker`'s trigger/dismiss pattern
 * but deliberately NOT reusing its focus-out/outside-click dismissal or a
 * focus trap: a full-screen panel has no "outside" to click, and the issue
 * asks explicitly for a menu that "closes without trapping focus" -- Tab
 * is free to leave the panel rather than cycling back through it. Opening
 * moves focus to the first destination link (so keyboard users don't have
 * to Tab past the close button to start navigating); Escape closes and
 * returns focus to the trigger; picking a destination lets the anchor's
 * default `#id` jump happen and closes the panel in the same click, so
 * scrolling there and dismissing the menu is one gesture.
 *
 * Document scroll is suspended while the panel is open (`documentElement`
 * is the real scroll container per `src/styles/layout.css`'s scroll-snap
 * note) so the full-screen list doesn't fight page scroll underneath it.
 *
 * Two things outside the panel itself have to be kept in sync while it's
 * open, both driven from this one effect:
 *
 * 1. Crossing the 880px `panel:` breakpoint (matching `useFitToViewport`'s
 *    `matchMedia` pattern) purely by CSS -- `panel:hidden` on this
 *    component's own root -- would hide the fixed full-screen panel (it's
 *    a descendant, so `display:none` cascades to it) while leaving `open`
 *    (and therefore the scroll lock) true, since resizing never touches
 *    React state on its own. A `matchMedia` listener closes the menu the
 *    moment the viewport crosses into desktop width so the lock always
 *    gets released.
 * 2. Not trapping focus (see above) still leaves every *other* focusable
 *    thing on the page -- the trigger button itself, the site mark link,
 *    the theme picker, the clock, the skip link, all of `<main>` -- in
 *    the normal tab sequence, sitting directly behind this panel's opaque
 *    `bg-bg`. Without something marking them non-interactive, Tab/Shift+Tab
 *    from the panel's own controls would silently move focus onto
 *    controls the user cannot see under the overlay. `inert` (not a focus
 *    trap -- Tab still leaves the panel, it just has nothing invisible
 *    left to land on) is applied to everything else in the document while
 *    open and lifted on close.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    firstLinkRef.current?.focus()

    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)

    const panelQuery = window.matchMedia('(min-width: 880px)')
    const onPanelChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false)
    }
    panelQuery.addEventListener('change', onPanelChange)

    const inertTargets: HTMLElement[] = []
    const wrapper = wrapperRef.current
    if (wrapper?.parentElement) {
      for (const sibling of Array.from(wrapper.parentElement.children)) {
        if (sibling !== wrapper && sibling instanceof HTMLElement) inertTargets.push(sibling)
      }
    }
    const scrollBar = document.querySelector<HTMLElement>('header > [role="progressbar"]')
    if (scrollBar) inertTargets.push(scrollBar)
    const skipLink = document.querySelector<HTMLElement>('a[href="#main-content"]')
    if (skipLink) inertTargets.push(skipLink)
    const main = document.getElementById('main-content')
    if (main) inertTargets.push(main)
    if (triggerRef.current) inertTargets.push(triggerRef.current)

    for (const el of inertTargets) el.inert = true

    return () => {
      root.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      panelQuery.removeEventListener('change', onPanelChange)
      for (const el of inertTargets) el.inert = false
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={wrapperRef} className="ml-auto panel:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'relative flex h-[30px] w-[30px] shrink-0 items-center justify-center',
          'border border-line-2 bg-transparent transition-colors duration-150 hover:border-accent',
        )}
      >
        <span aria-hidden="true" className="relative block h-[10px] w-[14px]">
          <span
            className={cn(
              'absolute inset-x-0 top-0 h-[1.5px] bg-fg transition-transform duration-150',
              open && 'translate-y-[4.25px] rotate-45',
            )}
          />
          <span
            className={cn(
              'absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 bg-fg transition-opacity duration-150',
              open && 'opacity-0',
            )}
          />
          <span
            className={cn(
              'absolute inset-x-0 bottom-0 h-[1.5px] bg-fg transition-transform duration-150',
              open && '-translate-y-[4.25px] -rotate-45',
            )}
          />
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="fixed inset-0 z-[70] flex flex-col bg-bg"
        >
          <div className="flex items-center justify-end px-[clamp(20px,4vw,56px)] py-[12px]">
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex h-[30px] w-[30px] items-center justify-center border border-line-2 text-fg"
            >
              <span aria-hidden="true" className="relative block h-[14px] w-[14px]">
                <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rotate-45 bg-fg" />
                <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 -rotate-45 bg-fg" />
              </span>
            </button>
          </div>

          <nav
            aria-label="Section"
            className="flex flex-1 flex-col items-center justify-center gap-[var(--space-md)]"
          >
            {navItems.map((item, index) => (
              <a
                key={item.id}
                ref={index === 0 ? firstLinkRef : undefined}
                href={`#${item.id}`}
                onClick={close}
                className="font-display text-fluid-lg tracking-[0.14em] text-dim transition-colors duration-150 hover:text-accent-2"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </div>
  )
}
