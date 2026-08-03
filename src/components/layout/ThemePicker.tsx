import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { getStoredThemeId, setTheme as persistTheme } from '@/theme/persistence'
import { DEFAULT_THEME_ID, THEMES } from '@/theme/themes'

/**
 * Header theme picker (#313, sample lines 275-288, `ideas/Portfolio.html`).
 *
 * The sample's markup is a raw Alpine-ish mockup (`sc-camel-on-click`,
 * `sc-if`, `sc-for`) with no keyboard or screen-reader behaviour at all --
 * a trigger button that toggles a dropdown of theme rows, each showing a
 * 3-swatch preview and a name. This component reproduces that visual
 * shape exactly (see the literal clamp/px values below, matched against
 * the sample line-by-line) but adds the interaction contract a mockup
 * never had: `aria-expanded`/`aria-haspopup` on the trigger, `Escape` and
 * outside-click/focus-out dismissal that returns focus to the trigger,
 * and `aria-checked` on the selected row instead of relying on colour
 * alone.
 *
 * Colour data (`THEMES[].swatch`) is the one legitimate place a literal
 * hex value appears in this codebase -- it's runtime data from
 * `src/theme/themes.ts`, applied via inline `style`, not a hardcoded
 * Tailwind class. Everything else here is a theme token.
 *
 * Persistence/recolouring itself is entirely `src/theme/persistence.ts`'s
 * job (`setTheme` applies `data-theme` and writes `localStorage`); this
 * component only tracks which theme is *currently* selected so it can
 * render the trigger's name/swatches and the dropdown's selected-row
 * state, seeded from whatever was already stored (or the default) so a
 * page that loaded with a previously-chosen theme shows the right theme
 * immediately rather than flashing back to ORIGINAL.
 *
 * Mobile-only collapse (owner review on #314's PR): below the 880px
 * `panel:` breakpoint the trigger has no room for the full swatch row,
 * the visible theme name, or its own bordered box (three colour squares
 * plus "ORIGINAL" inside a wide border was measured overflowing/colliding
 * with the hamburger at phone widths). Below `panel:` the trigger renders
 * as one square swatch (the active theme's first colour) with no border
 * and no visible text; `aria-label` (not the visible name text, which is
 * `hidden` and therefore stripped from the accessible name below the
 * breakpoint) carries the accessible name at every width, so the control
 * stays keyboard-operable and namer-complete on its own regardless of
 * which visual it's rendering. `panel:` classes restore the desktop
 * swatch row, name, and bordered box exactly as before.
 */
export function ThemePicker() {
  const [themeId, setThemeId] = useState(() => getStoredThemeId() ?? DEFAULT_THEME_ID)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  const activeTheme = THEMES.find((theme) => theme.id === themeId) ?? THEMES[0]

  useEffect(() => {
    if (!open) return

    const container = containerRef.current

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    const onPointerDown = (event: MouseEvent) => {
      if (container && !container.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null
      if (!container || !next || !container.contains(next)) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    container?.addEventListener('focusout', onFocusOut)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
      container?.removeEventListener('focusout', onFocusOut)
    }
  }, [open])

  const pick = (id: string) => {
    persistTheme(id)
    setThemeId(id)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    // `ml-auto` lives here, not on the button: this `div` is the actual flex
    // item in the header row, so it's the element that needs the auto margin
    // to consume the row's free space. Putting it on the button (an in-flow
    // child of this shrink-wrapped div, not itself a flex item of the row)
    // had no free space to push into, so it visually did nothing.
    <div ref={containerRef} className="relative ml-auto panel:ml-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Theme: ${activeTheme.name}`}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-[30px] w-[30px] shrink-0 items-center justify-center gap-[8px] border-0 bg-transparent p-0',
          'panel:h-auto panel:w-auto panel:justify-start panel:border panel:border-line-2 panel:px-[10px] panel:py-[7px]',
          'font-mono text-[10px] tracking-[0.16em] text-dim',
          'transition-[color,border-color] duration-150 hover:border-accent hover:text-fg',
        )}
      >
        {/* Mobile trigger uses swatch[1] (the accent colour), not swatch[0]
            (the background colour) -- swatch[0] on every theme is near-black,
            near-identical to the header's own background, so a single dot in
            that colour was rendering but effectively invisible. */}
        <span aria-hidden="true" className="h-[14px] w-[14px] panel:hidden" style={{ background: activeTheme.swatch[1] }} />
        <span aria-hidden="true" className="hidden gap-[2px] panel:flex">
          {activeTheme.swatch.map((color, index) => (
            <span key={index} className="h-[9px] w-[9px]" style={{ background: color }} />
          ))}
        </span>
        <span aria-hidden="true" className="hidden panel:inline">
          {activeTheme.name}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Theme"
          className="absolute top-[calc(100%+11px)] right-0 z-[80] flex min-w-[216px] flex-col gap-[3px] border border-line-2 bg-panel p-[7px]"
        >
          {THEMES.map((theme) => {
            const selected = theme.id === themeId
            return (
              <button
                key={theme.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => pick(theme.id)}
                className={cn(
                  'flex items-center gap-[10px] border px-[9px] py-[8px] text-left',
                  'font-mono text-[10px] tracking-[0.14em]',
                  'transition-colors duration-150 hover:bg-panel-2',
                  selected ? 'border-accent bg-panel-2 text-fg' : 'border-line-2 text-dim',
                )}
              >
                <span aria-hidden="true" className="flex gap-[2px]">
                  {theme.swatch.map((color, index) => (
                    <span key={index} className="h-[12px] w-[12px]" style={{ background: color }} />
                  ))}
                </span>
                {theme.name}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
