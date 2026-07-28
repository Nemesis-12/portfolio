import { cn } from '@/lib/cn'

/**
 * Static under-construction placeholder. The rewrite (spec at
 * docs/spec-portfolio-rewrite.md) replaces this with the full six-section
 * page in later tickets. This ticket only lays the foundation: strict TS,
 * the `@/*` alias, self-hosted fonts, the `cn()` helper, and the ORIGINAL
 * theme's colour tokens.
 *
 * No animation, no loading gate, no header — first paint is the finished
 * page.
 */
function App() {
  return (
    <main
      className={cn(
        'flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center',
        'bg-bg text-fg',
      )}
    >
      <h1
        className={cn(
          'font-display text-[clamp(1.1rem,4vw,1.75rem)] leading-relaxed text-accent-2',
        )}
      >
        UNDER CONSTRUCTION
      </h1>
      <p className={cn('font-mono text-sm text-dim md:text-base')}>
        Farhan Mohammed's portfolio is being rebuilt from scratch. Check back soon.
      </p>
    </main>
  )
}

export default App
