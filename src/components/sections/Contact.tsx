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
 * which is résumé-derived and wins over the sample's own placeholder
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
          <p className="text-[10px] tracking-[0.2em] text-accent-2">{meta.eyebrow}</p>

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
           */}
          <h2
            id="contact-heading"
            aria-label="LET'S BUILD SOMETHING SMALL AND FAST"
            className="m-0 mt-[20px] font-display text-[clamp(20px,3.8vw,46px)] leading-[1.35] text-fg"
          >
            <span aria-hidden="true">
              LET&apos;S BUILD
              <br />
              SOMETHING
              <br />
              <span className="bg-accent px-[0.05em] pb-[0.05em] text-bg">SMALL AND FAST</span>
            </span>
          </h2>

          <p className="mt-[24px] max-w-[52ch] text-[15px] leading-[1.8] text-dim [text-wrap:pretty]">
            {CONTACT_STATEMENT}
          </p>
        </div>

        <ul className="flex flex-col border-t border-line">
          {CONTACT_LINKS.map((link) => (
            <li key={link.id} className="border-b border-line">
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="flex items-baseline justify-between gap-[14px] py-[17px] text-[14px] text-fg-2 transition-[padding-left,color] duration-[180ms] hover:text-accent-2 motion-safe:hover:pl-[10px]"
              >
                <span className="text-fg">{link.detail}</span>
                <span className="text-[10px] uppercase tracking-[0.16em] text-dim-2">
                  {link.label} <span aria-hidden="true">→</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-[clamp(30px,5vh,52px)] border-t border-line pt-[20px] text-[9.5px] tracking-[0.18em] text-dim-3">
        <span>{CONTACT_FOOTER}</span>
      </div>
    </Section>
  )
}
