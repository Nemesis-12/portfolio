import { Section } from '@/components/layout/Section'
import { CONTACT_FOOTER, CONTACT_LINKS, CONTACT_STATEMENT } from '@/data/contact'
import { getSectionMeta } from '@/data/sections'

const meta = getSectionMeta('contact')

/**
 * Closing section (issue #321, mochi/style-match): a headline, a one-line
 * statement of what work is being sought, direct labelled links, and a
 * footer -- sample lines 559-576, `ideas/Portfolio.html`.
 *
 * The headline and footer are chrome (no sample counterpart existed in the
 * previous version of this component) and are taken verbatim; the
 * statement and link copy/hrefs stay sourced from `src/data/contact.ts`,
 * which is resume-derived and wins over the sample's own placeholder
 * prose.
 *
 * This is the last section and the page's densest run of links, so tab
 * order (document order, top to bottom) and the global `:focus-visible`
 * ring (`src/index.css`) matter more here than anywhere else -- no link
 * suppresses or replaces that ring.
 */
export function Contact() {
  return (
    <Section id={meta.id} headingId="contact-heading">
      {/*
       * Two-column grid (auto-fit, min 300px, items aligned to the end)
       * with `gap:clamp(28px,4vw,60px)`, matching the reference's own
       * `data-fit` grid for this section exactly (line 560) -- not a flex
       * column stack.
       */}
      <div className="grid items-end gap-[clamp(28px,4vw,60px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        <div>
          <p className="text-[10px] tracking-[0.2em] text-accent-2 panel:text-fit-xs">
            {meta.eyebrow}
          </p>

          {/*
           * Sample line 563: "LET'S BUILD<br>SOMETHING<br><span
           * ...>SMALL AND FAST</span>" -- an aria-label on the heading
           * itself supplies the one continuous accessible string ("LET'S
           * BUILD SOMETHING SMALL AND FAST"), since `<br>`-separated text
           * nodes are not reliably concatenated with whitespace by the
           * accessible-name algorithm across browsers. The visible,
           * line-broken markup is then hidden from assistive tech so the
           * two representations of the same heading are never both
           * exposed to it.
           *
           * Sizing (owner follow-up, #372): the reference's own
           * `clamp(20px,3.8vw,46px)` reads squished at desktop -- the
           * whole content block sat under half the section's height with
           * large empty bands top and bottom. Above 880px this now scales
           * against viewport HEIGHT instead of width
           * (`clamp(30px,5.6vh,74px)`, same vh-clamp idiom the reference
           * uses for everything below a section's heading row, see
           * `src/styles/layout.css`), so the headline grows with the
           * space the section actually has and shrinks back down at short
           * viewports instead of overflowing `100dvh`. The 74px ceiling
           * keeps `SOMETHING` (the widest line) clear of the ~387px
           * column width at the 880px breakpoint's narrowest two-column
           * layout. Below 880px the original width-based clamp is
           * untouched -- this growth is a desktop-only fix.
           */}
          <h2
            id="contact-heading"
            aria-label="LET'S BUILD SOMETHING SMALL AND FAST"
            className="m-0 mt-[20px] font-display text-[clamp(20px,3.8vw,46px)] leading-[1.35] text-fg panel:text-[clamp(30px,5.6vh,74px)]"
          >
            <span aria-hidden="true">
              LET&apos;S BUILD
              <br />
              SOMETHING
              <br />
              <span className="bg-accent px-[0.05em] pb-[0.05em] text-bg">SMALL AND FAST</span>
            </span>
          </h2>

          {/*
           * Statement sizing (#372): `max-w-[52ch]` is in `ch` units, so it
           * scales in lockstep with font-size -- growing the font doesn't
           * add a 4th wrapped line, it keeps the same ~3-line shape at a
           * larger scale. `panel:mt-[var(--space-fit-margin)]` reuses the
           * existing "fit-box margin under a heading" token rather than
           * inventing one; the font-size itself needs a taller ceiling
           * than any of the `--text-fit-*` tokens offer (all cap by
           * ~920vh), so it stays a one-off vh clamp here.
           */}
          <p className="mt-[24px] max-w-[52ch] text-[15px] leading-[1.8] text-dim [text-wrap:pretty] panel:mt-[var(--space-fit-margin)] panel:text-[clamp(16px,2.6vh,34px)]">
            {CONTACT_STATEMENT}
          </p>
        </div>

        <ul className="flex flex-col border-t border-line">
          {/*
           * Link row sizing (owner follow-up, #372): the first pass's
           * `panel:text-[clamp(16px,2.4vh,26px)]` detail text ("send me an
           * email", "read the code", ...) read too large next to the rest
           * of the block. Brought down one step to
           * `clamp(15px,1.9vh,20px)` -- still clearly bigger than the
           * pre-#372 fixed `14px`, just no longer competing with the
           * statement line for attention. `panel:py-[...]` was raised in
           * the same move (`clamp(20px,3.6vh,44px)` ->
           * `clamp(22px,3.9vh,48px)`) so each row's total height (padding
           * + text) stays within ~1px of what it was before this tweak at
           * every viewport height checked (900/1160/800px) -- the list's
           * overall block height, and the section's fill, shouldn't
           * change, only the text/whitespace balance within each row.
           */}
          {CONTACT_LINKS.map((link) => (
            <li key={link.id} className="border-b border-line">
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="flex items-baseline justify-between gap-[14px] py-[17px] text-[14px] text-fg-2 transition-[padding-left,color] duration-[180ms] hover:text-accent-2 motion-safe:hover:pl-[10px] panel:py-[clamp(22px,3.9vh,48px)] panel:text-[clamp(15px,1.9vh,20px)]"
              >
                <span className="text-fg">{link.detail}</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-dim-2 panel:text-fit-xs">
                  {link.label} <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/*
       * Divider top padding (#359): was a fixed inline `20px`; unified onto
       * `--space-fit-md`, the same border-t+padding-top treatment now
       * shared by `ProjectCard.tsx`'s stats footer, Education &
       * Experience's bullet list divider, and the Leviathan pipeline's
       * "move" row -- four dividers that previously each had a different
       * top padding.
       *
       * `panel:mt-[clamp(40px,7.5vh,95px)]` (#372): grows the gap between
       * the grid and the footer at desktop so the block's own internal
       * rhythm scales along with the headline/statement/links above,
       * rather than leaving that whitespace fixed while everything around
       * it grows -- part of closing the ~45%-of-section-height gap
       * without pushing the block edge-to-edge (the footer itself, and
       * the eyebrow above the grid, are deliberately left closer to their
       * original scale so the block keeps a light top/bottom edge rather
       * than reading as uniformly blown up).
       */}
      <div className="mt-[clamp(30px,5vh,52px)] border-t border-line pt-[var(--space-fit-md)] text-[9.5px] tracking-[0.18em] text-dim-3 panel:mt-[clamp(40px,7.5vh,95px)] panel:pt-[var(--space-fit-margin)] panel:text-fit-2xs">
        <span>{CONTACT_FOOTER}</span>
      </div>
    </Section>
  )
}
