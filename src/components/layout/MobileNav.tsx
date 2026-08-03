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
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)
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

    return () => {
      root.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div className="ml-auto panel:hidden">
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
