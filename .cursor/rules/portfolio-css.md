# Portfolio CSS anchor

`src/portfolio.css` is the canonical stylesheet for portfolio component visuals. Rules are ported verbatim from `ideas/Portfolio.html` (reference `<style>` block, lines 39–233) inside `@layer components`, using token variables from `src/index.css` (`var(--color-*)`, `var(--font-*)`).

## Required behavior

- **Apply portfolio classes** — Use class names from `src/portfolio.css` (e.g. `hero-name`, `pcard`, `bento`, `tl-org`, `footer-big`, `nav-link`, `btn-fill`) for layout-critical and typography-critical styling.
- **Do not replace with Tailwind** — Never substitute Tailwind utilities for properties already defined on a portfolio class (font sizes, padding in `vw`, `clamp()`, `letter-spacing`, `clip-path`, grid areas, colors, etc.).
- **Check the anchor first** — Before adding Tailwind for a new element, search `src/portfolio.css` and `ideas/Portfolio.html` for an existing class.
- **Tailwind is structural only** — Utilities like `flex`, `relative`, `z-10`, or `shrink-0` are fine when they do not override portfolio-class properties.
- **Tokens stay in index.css** — Do not duplicate the `:root` color or font token block in `portfolio.css`. Add new global tokens in `src/index.css` if needed.

## Reference

- Design intent: `PRD.md`, `ideas/Portfolio.html`
- Color and scrollbar/selection chrome: `src/index.css`
