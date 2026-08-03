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
