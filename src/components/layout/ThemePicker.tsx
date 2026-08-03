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
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-[8px] border border-line-2 bg-transparent px-[10px] py-[7px]',
          'font-mono text-[10px] tracking-[0.16em] text-dim',
          'transition-[color,border-color] duration-150 hover:border-accent hover:text-fg',
        )}
      >
        <span aria-hidden="true" className="flex gap-[2px]">
          {activeTheme.swatch.map((color, index) => (
            <span key={index} className="h-[9px] w-[9px]" style={{ background: color }} />
          ))}
        </span>
        <span className="sr-only">Theme: </span>
        {activeTheme.name}
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
