/**
 * The heading row every section except the hero and Contact opens with
 * (sample lines 332-337, 417-422, 461-465, 492-496, `ideas/Portfolio.html`):
 *
 *   <div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap">
 *     <span style="font-family:'Press Start 2P',monospace;font-size:11px;color:var(--accent)">01</span>
 *     <span style="font-family:'Press Start 2P',monospace;font-size:clamp(15px,2.2vw,24px)">PROJECTS</span>
 *     <span style="flex:1;min-width:30px;border-top:1px solid var(--line)"></span>
 *     <span style="font-size:10px;letter-spacing:.18em;color:var(--dim)">FEATURED</span>
 *   </div>
 *
 * Reproduced verbatim -- `gap-4` is Tailwind's literal 16px, and the
 * `clamp(15px,2.2vw,24px)` on the title is inlined because it appears in
 * the sample byte-for-byte, not because this codebase's fluid type scale
 * (`src/styles/layout.css`) has a matching step.
 *
 * `title` renders as the section's real `<h2>` (via `headingId`) so
 * `Section`'s `aria-labelledby` wiring (`src/components/layout/Section.tsx`)
 * keeps sourcing the landmark's accessible name from a real, visible
 * heading. The number and the rule are purely decorative, so both carry
 * `aria-hidden`.
 */
interface SectionHeadingProps {
  /** Chrome section number, e.g. "01". */
  number: string
  /** Chrome section title, e.g. "PROJECTS". Rendered as the section's `<h2>`. */
  title: string
  /** DOM id for the `<h2>`, matched by the parent `Section`'s `headingId`. */
  headingId: string
  /** Right-hand label, e.g. "FEATURED". Omitted for Skills and Timeline. */
  label?: string
}

export function SectionHeading({ number, title, headingId, label }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-4">
      <span aria-hidden="true" className="font-display text-[11px] text-accent">
        {number}
      </span>
      <h2
        id={headingId}
        className="m-0 font-display text-[clamp(15px,2.2vw,24px)] font-normal text-fg"
      >
        {title}
      </h2>
      <span aria-hidden="true" className="min-w-[30px] flex-1 border-t border-line" />
      {label ? (
        <span className="text-[10px] tracking-[0.18em] text-dim">{label}</span>
      ) : null}
    </div>
  )
}
