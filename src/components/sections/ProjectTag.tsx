export interface ProjectTagProps {
  /** e.g. "SHIPPED", "PUBLISHED". */
  readonly label: string
  readonly year: number
}

/**
 * The one filled project-status tag every project card shares (mochi/
 * style-match task 2): Leviathan's `SHIPPED · 2025` pill
 * (`ProjectsFeatured.tsx`, sample line 343) was previously hand-written
 * only there, with the other cards each rendering their own ad-hoc badge
 * markup. Factored out so every card, including a future one added purely
 * via project data (`src/data/otherProjects.ts`), gets the same
 * `LABEL · YEAR` near-white filled box by supplying `label`/`year` data --
 * no markup change needed here ever again.
 */
export function ProjectTag({ label, year }: ProjectTagProps) {
  return (
    <span className="shrink-0 whitespace-nowrap bg-fg px-2 py-[4px] text-2xs tracking-[0.18em] text-bg">
      {label} · {year}
    </span>
  )
}
