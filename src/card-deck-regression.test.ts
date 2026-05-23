/// <reference types="node" />

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      return collectSourceFiles(fullPath)
    }

    if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.test.tsx')) {
      return [fullPath]
    }

    return []
  })
}

describe('issue #214 - card-deck depth regression guard', () => {
  it('does not ship the global useCardDeckDepth hook', () => {
    expect(existsSync(join(srcDir, 'hooks', 'useCardDeckDepth.ts'))).toBe(false)
  })

  it('does not import useCardDeckDepth anywhere in source', () => {
    const sourceFiles = collectSourceFiles(srcDir)
    const offenders = sourceFiles.filter((filePath) =>
      readFileSync(filePath, 'utf8').includes('useCardDeckDepth'),
    )

    expect(offenders).toEqual([])
  })

  it('does not style global sticky section surfaces for card-deck depth', () => {
    const portfolioCss = readFileSync(join(srcDir, 'portfolio.css'), 'utf8')

    expect(portfolioCss).not.toMatch(
      /\[data-sticky-section="true"\]:not\(\[data-sticky-scroll-host="true"\]\)\{[^}]*position:sticky/,
    )
  })
})
