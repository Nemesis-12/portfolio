import { useLayoutEffect, useRef } from 'react'
import type { Ref, RefObject } from 'react'
import { navItems } from '@/data/nav'
import { cn } from '@/lib/cn'
import { Clock } from './Clock'
import { MobileNav } from './MobileNav'
import { ScrollProgressBar } from './ScrollProgressBar'
import { ThemePicker } from './ThemePicker'

/**
 * Fixed site header (#312, #313): site mark, the four nav destinations,
 * the theme picker (`ThemePicker`), and a live clock, with the scroll
 * progress bar as its last child (matching the design reference, which
 * nests the bar inside the header).
 *
 * Below the 880px `panel:` breakpoint (#314) the inline `<nav>` is hidden
 * (`hidden panel:flex`) and `MobileNav` takes its place, so the header
 * never has to cram all four links plus the theme picker into a phone-width
 * bar -- see `MobileNav.tsx` for the full-screen menu it opens.
 *
 * Mobile-only trailing-group layout (owner review on #314's PR): below
 * 880px the hamburger trigger must be the right-most element, with the
 * theme picker collapsed to a single swatch and the clock dropping its
 * seconds -- all three purely mobile concerns, so all three live as
 * `panel:`-gated classes inside `MobileNav`/`ThemePicker`/`Clock`
 * themselves rather than here. This component still owns the ordering:
 * `MobileNav`'s wrapper is `order-last` (inert at desktop, where it's
 * `panel:hidden` and out of flow entirely) and `ThemePicker`'s own flex-item
 * root carries the `ml-auto` below 880px (the inline `<nav>` supplies it
 * above 880px, so `ThemePicker` cancels its own with `panel:ml-0` there) so
 * the trailing group -- theme picker, clock, hamburger, in that DOM/visual
 * order -- is pushed flush right as one unit.
 *
 * Fixed-header / scroll-snap interaction: a `position: fixed` header would
 * otherwise cover a section's top when `scroll-snap-align: start`
 * (`.section-shell`) aligns it to the scrollport, or a native `#id` anchor
 * jump lands there. `src/styles/layout.css` has the full story of why the
 * fix is sizing (every section's own top `padding-block` clamp already
 * exceeds the header's height) rather than a `scroll-padding-top` offset
 * (tried and removed -- see that file for why).
 *
 * `--header-h` is published here via `ResizeObserver` rather than a fixed
 * guess, since the header's rendered height changes with the fluid type
 * scale and with viewport width; `layout.css`'s base `.section-shell` rule
 * consumes it in `max(var(--space-lg), var(--header-h) + var(--space-md))`.
 *
 * `overlayBackground` (#355): forwarded straight through to `MobileNav`,
 * unopened -- `App.tsx` is the one place that declares what counts as
 * "background" for the mobile nav's overlay (see its docstring), and this
 * component is just the layer that composition happens to pass through.
 * `ref` here is a second, independent thing: it's *this* header element's
 * own node being merged into `App.tsx`'s background list (the header, and
 * everything inside it -- nav links, theme picker, clock, progress bar,
 * `MobileNav`'s own trigger -- all become `inert` together when the panel
 * marks it as background), not something `Header` itself reads.
 */
export function Header({
  ref,
  overlayBackground,
}: {
  ref?: Ref<HTMLElement>
  overlayBackground: RefObject<HTMLElement | null>[]
}) {
  const headerRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const publish = () => {
      document.documentElement.style.setProperty('--header-h', `${el.getBoundingClientRect().height}px`)
    }

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      ref={(node) => {
        headerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className="fixed inset-x-0 top-0 z-[60] border-b border-line bg-bg-glass backdrop-blur-[9px]"
    >
      <div className="flex items-center gap-[clamp(10px,1.6vw,20px)] px-[clamp(20px,4vw,56px)] py-[12px]">
        <a href="#top" className="flex items-center gap-[9px] font-display text-[11px] text-fg">
          <span aria-hidden="true" className="inline-block h-[11px] w-[11px] rounded-full bg-fg" />
          F.M
        </a>

        <nav
          aria-label="Section"
          className="ml-auto hidden gap-[clamp(10px,1.8vw,24px)] text-[10.5px] tracking-[0.16em] text-dim panel:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn('transition-colors duration-150 hover:text-accent-2')}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <MobileNav overlayBackground={overlayBackground} />

        <ThemePicker />

        <Clock />
      </div>

      <ScrollProgressBar />
    </header>
  )
}
