import { useLayoutEffect, useRef } from 'react'
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
 * `panel:hidden` and out of flow entirely) and `ThemePicker` carries the
 * `ml-auto` below 880px (the inline `<nav>` supplies it above 880px, so
 * `ThemePicker` cancels its own with `panel:ml-0` there) so the trailing
 * group -- theme picker, clock, hamburger, in that DOM/visual order --
 * is pushed flush right as one unit.
 *
 * Fixed-header / scroll-snap interaction: `scroll-snap-align: start`
 * (`.section-shell`, src/styles/layout.css) aligns each section to the
 * top of the scrollport, and native `#id` anchor jumps land at the exact
 * top of the target element -- both of which a `position: fixed` header
 * would otherwise cover. The sample (`ideas/Portfolio.html`) never
 * compensates for this at the scroll-container level (no
 * `scroll-padding-top`; line 245 sets only `scroll-behavior`/
 * `scroll-snap-type`) -- it relies purely on every section's own top
 * `padding-block` clamp (`.section-shell`) already exceeding the header's
 * rendered height, so the header only ever overlaps padding, never real
 * content. This held at 880px+ (`clamp(4rem,9vh,5.5rem)` there comfortably
 * clears the header) but not below it, where `.section-shell`'s base
 * padding floors at 2.4rem/38.4px against a mobile header nearer 55-60px
 * tall -- the hero eyebrow and every other section's heading row rendered
 * partly behind the header (#314 owner review). `--header-h` is
 * republished here (measured via `ResizeObserver`, not guessed, since the
 * header's rendered height changes with the fluid type scale) so
 * `layout.css`'s base `.section-shell` rule can clear it with
 * `max(var(--space-lg), var(--header-h))`; the 880px+ override still uses
 * its own clamp unconditionally, so desktop is unaffected.
 */
export function Header() {
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
      ref={headerRef}
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

        <MobileNav />

        <ThemePicker />

        <Clock />
      </div>

      <ScrollProgressBar />
    </header>
  )
}
