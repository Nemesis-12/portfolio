import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

const COPIED_LABEL_MS = 1500

interface CopyInstallCommandProps {
  command: string
  className?: string
}

/**
 * The MLA library's install command, copyable in one step (issue #318:
 * "so a visitor can use it in one step"). This is a small UI affordance,
 * not a decorative animation loop, so it does not go through
 * `usePrefersReducedMotion` — the only state here is a text label that
 * reverts after a short delay, cleaned up on unmount.
 *
 * The button's label swap (copy → copied) is echoed into a visually
 * hidden `aria-live="polite"` region so assistive tech gets the same
 * confirmation a sighted visitor sees, rather than a silent text swap.
 *
 * When the Clipboard API is unavailable (e.g. insecure contexts, some
 * test environments) the button is disabled rather than left looking
 * active while doing nothing on click -- the command itself is always
 * plain selectable text, so a visitor can still copy it by hand.
 */
export function CopyInstallCommand({ command, className }: CopyInstallCommandProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const clipboardAvailable = useMemo(
    () => typeof navigator !== 'undefined' && !!navigator.clipboard,
    [],
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    if (!clipboardAvailable) return
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), COPIED_LABEL_MS)
    } catch {
      // Clipboard write can be denied by the browser -- the command text
      // itself is still visible and selectable, so this is a silent no-op.
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-[9px] bg-panel-2 px-[14px] py-[12px] font-mono text-2xs text-fg-2 panel:flex-row panel:items-center',
        className,
      )}
    >
      {/* Command wraps (word-break: break-word) instead of scrolling below 880px -- horizontal scroll inside a strip this narrow isn't discoverable on a phone. */}
      <div className="flex items-start gap-[9px] panel:min-w-0 panel:flex-1 panel:items-center">
        <span aria-hidden="true" className="shrink-0 text-accent-2">
          $
        </span>
        <span className="min-w-0 flex-1 break-words">{command}</span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!clipboardAvailable}
        aria-label={clipboardAvailable ? undefined : 'Copy unavailable -- select the command text above instead'}
        className="shrink-0 self-end whitespace-nowrap border border-line-2 px-[var(--space-2xs)] py-[2px] text-2xs text-dim tracking-[0.1em] hover:border-accent hover:text-accent-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line-2 disabled:hover:text-dim panel:self-auto"
      >
        {copied ? 'copied' : 'copy'}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Command copied to clipboard' : ''}
      </span>
    </div>
  )
}
