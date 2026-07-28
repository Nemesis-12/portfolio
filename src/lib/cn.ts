import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names, resolving Tailwind utility conflicts in favour of the
 * last one specified. Thin wrapper around clsx + tailwind-merge, the
 * standard shadcn/ui pairing — kept here so shadcn components can be added
 * later without introducing a second implementation.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
