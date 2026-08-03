import { useLayoutEffect, useRef } from 'react'
import { navItems } from '@/data/nav'
import { cn } from '@/lib/cn'
import { Clock } from './Clock'
import { ScrollProgressBar } from './ScrollProgressBar'
import { ThemePicker } from './ThemePicker'

/**
 * Fixed site header (#312, #313): site mark, the four nav destinations,
 * the theme picker (`ThemePicker`), and a live clock, with the scroll
 * progress bar as its last child (matching the design reference, which
 * nests the bar inside the header).
 *
 * Fixed-header / scroll-snap interaction: `scroll-snap-align: start`
 * (`.section-shell`, src/styles/layout.css) aligns each section to the
 * top of the scrollport, and native `#id` anchor jumps land at the exact
 * top of the target element -- both of which a `position: fixed` header
 * would otherwise cover. This component measures its own rendered height
 * and publishes it as the `--header-h` custom property on the document
 * root; `layout.css` sets `scroll-padding-top: var(--header-h, ...)` on
 * `:root` (the real scroll container), which shifts *both* the snap
 * landing point and anchor-link scrolling down by exactly the header's
 * height. A static guess would drift the moment header content wraps at
 * a narrow viewport or the fluid type scale changes its rendered size;
 * measuring keeps the two in sync automatically.
 */
export function Header() {
  const headerRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return

    const publishHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`)
    }

    publishHeaderHeight()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', publishHeaderHeight)
      return () => window.removeEventListener('resize', publishHeaderHeight)
    }

    const observer = new ResizeObserver(publishHeaderHeight)
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
          className="ml-auto flex gap-[clamp(10px,1.8vw,24px)] text-[10.5px] tracking-[0.16em] text-dim"
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

        <ThemePicker />

        <Clock />
      </div>

      <ScrollProgressBar />
    </header>
  )
}
