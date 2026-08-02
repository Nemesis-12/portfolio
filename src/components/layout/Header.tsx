import { useLayoutEffect, useRef } from 'react'
import { navItems } from '@/data/nav'
import { cn } from '@/lib/cn'
import { Clock } from './Clock'
import { ScrollProgressBar } from './ScrollProgressBar'

/**
 * Fixed site header (#312): site mark, the four nav destinations, and a
 * live clock, with the scroll progress bar as its last child (matching
 * the design reference, which nests the bar inside the header).
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
      className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg-glass/92 backdrop-blur-md"
    >
      <div className="flex items-center gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-2xs)]">
        <a
          href="#top"
          className="flex items-center gap-[var(--space-3xs)] font-display text-2xs text-fg"
        >
          <span aria-hidden="true" className="inline-block h-[11px] w-[11px] rounded-full bg-fg" />
          F.M
        </a>

        <nav aria-label="Section" className="ml-auto flex gap-[var(--space-sm)]">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                'text-fluid-xs font-mono uppercase tracking-[0.16em] text-dim',
                'transition-colors hover:text-accent-2',
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Clock />
      </div>

      <ScrollProgressBar />
    </header>
  )
}
