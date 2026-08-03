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
 * would otherwise cover. The sample (`ideas/Portfolio.html`) never
 * compensates for this at the scroll-container level (no
 * `scroll-padding-top`; line 245 sets only `scroll-behavior`/
 * `scroll-snap-type`) -- it relies purely on every section's own top
 * `padding-block` clamp (`.section-shell`) already exceeding the header's
 * rendered height, so the header only ever overlaps padding, never real
 * content. This component previously measured its own rendered height
 * and published it as a `--header-h` custom property so `layout.css`
 * could offset `scroll-padding-top` by it; that offset was removed
 * (mochi/style-match audit -- see `layout.css`) because stacking it on
 * top of the section's own padding double-offset every section below the
 * header, so the height-measuring effect that fed it is removed here too.
 */
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-[60] border-b border-line bg-bg-glass backdrop-blur-[9px]">
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
