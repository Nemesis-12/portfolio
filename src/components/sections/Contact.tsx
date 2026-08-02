import { Section } from '@/components/layout/Section'
import { CONTACT_LINKS, CONTACT_STATEMENT } from '@/data/contact'
import { getSectionMeta } from '@/data/sections'

const meta = getSectionMeta('contact')

/**
 * Closing section (issue #321): a one-line statement of what work is being
 * sought, then direct, labelled links to email, GitHub, LinkedIn, and the
 * résumé. All copy and hrefs live in `src/data/contact.ts` -- this
 * component is pure presentation over that module.
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
       * `data-fit` grid for this section exactly -- not a flex column
       * stack.
       */}
      <div className="grid items-end gap-[clamp(28px,4vw,60px)] [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
        <div className="flex flex-col gap-[var(--space-sm)]">
          <p className="font-mono text-fluid-xs tracking-[0.2em] text-dim">{meta.eyebrow}</p>
          <h2 id="contact-heading" className="font-display text-fluid-2xl leading-tight text-fg">{meta.title}</h2>
          <p className="max-w-[52ch] text-fluid-base text-fg-2">{CONTACT_STATEMENT}</p>
        </div>

        <ul className="flex flex-col border-t border-line">
          {CONTACT_LINKS.map((link) => (
            <li key={link.id} className="border-b border-line">
              <a
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="flex items-baseline justify-between gap-[var(--space-sm)] py-[var(--space-xs)] text-fluid-sm text-fg-2 transition-colors hover:text-accent-2"
              >
                <span className="font-display text-fg">{link.label}</span>
                <span className="text-2xs tracking-[0.16em] text-dim">
                  {link.detail} <span aria-hidden="true">↗</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
