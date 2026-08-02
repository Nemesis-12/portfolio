import type { MouseEvent } from 'react'

/**
 * Skip link (#312). Must be the very first focusable element in DOM order
 * -- rendered before the header in `App.tsx` -- so a keyboard user's first
 * Tab lands here instead of on the site mark or nav links.
 *
 * Visually hidden until focused (Tailwind's `sr-only`/`focus:not-sr-only`
 * pair), matching the standard skip-link pattern.
 *
 * The target (`#main-content`) is not natively focusable, so clicking or
 * activating this link moves focus there explicitly rather than relying on
 * browsers' inconsistent "focus the fragment target" behaviour -- the
 * target carries `tabIndex={-1}` (see `App.tsx`) precisely so this works.
 */
export function SkipLink() {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('main-content')
    if (!target) return

    // Let the browser handle the hash/scroll too; we only need to
    // guarantee focus actually lands on the target.
    event.preventDefault()
    target.focus()
    target.scrollIntoView?.()
    window.history.pushState(null, '', '#main-content')
  }

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-[var(--space-2xs)] focus:left-[var(--space-2xs)] focus:z-[100] focus:border focus:border-line-2 focus:bg-bg focus:px-[var(--space-sm)] focus:py-[var(--space-2xs)] focus:text-fluid-sm focus:font-mono focus:text-fg"
    >
      Skip to content
    </a>
  )
}
