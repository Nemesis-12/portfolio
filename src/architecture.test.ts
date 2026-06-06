/**
 * Architecture boundary: data vs UI
 *
 * Canonical production data (resume entries, project lists, etc.) must live in
 * src/data/ or dedicated *.constants.ts modules — not in UI render components.
 * Files under src/data/, src/hooks/, and test modules must not value-import
 * canonical datasets exported from src/components/*.tsx render modules.
 *
 * Type-only imports from components are allowed. Imports from *.constants.ts
 * files are allowed. UI components may consume domain data; they must not
 * be the source of truth. Issue #253 will relocate timelineEntries.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))
const componentsDir = join(srcDir, 'components')

function collectFiles(directory: string, predicate: (name: string) => boolean): string[] {
  if (!existsSync(directory)) return []

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      return collectFiles(fullPath, predicate)
    }
    return predicate(entry.name) ? [fullPath] : []
  })
}

function collectBoundaryConsumerFiles(): string[] {
  const dataAndHooks = [
    ...collectFiles(join(srcDir, 'data'), (name) => /\.(ts|tsx)$/.test(name)),
    ...collectFiles(join(srcDir, 'hooks'), (name) => /\.(ts|tsx)$/.test(name)),
  ]
  const tests = collectFiles(
    srcDir,
    (name) => /\.test\.(ts|tsx)$/.test(name) && !name.endsWith('architecture.test.ts'),
  )

  return [...new Set([...dataAndHooks, ...tests])]
}

function collectRenderComponentFiles(): string[] {
  return collectFiles(componentsDir, (name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
}

function findExportedCanonicalDatasets(componentSource: string): string[] {
  const moduleLevelConstArraysOrObjects = new Set<string>()
  for (const match of componentSource.matchAll(/^const\s+(\w+)\s*(?::[^=]+)?=\s*[[{]/gm)) {
    moduleLevelConstArraysOrObjects.add(match[1])
  }

  const exportedNames = new Set<string>()
  for (const match of componentSource.matchAll(/export\s*\{\s*([^}]+)\s*\}/g)) {
    for (const binding of match[1].split(',')) {
      const name = binding.trim().split(/\s+as\s+/)[0]?.trim()
      if (name) exportedNames.add(name)
    }
  }
  for (const match of componentSource.matchAll(
    /export\s+const\s+(\w+)\s*(?::[^=]+)?=\s*[[{]/gm,
  )) {
    exportedNames.add(match[1])
  }

  return [...moduleLevelConstArraysOrObjects].filter((name) => exportedNames.has(name))
}

function parseValueImports(
  source: string,
): Array<{ symbols: string[]; from: string; line: number }> {
  const imports: Array<{ symbols: string[]; from: string; line: number }> = []
  const lines = source.split('\n')

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (!/^\s*import\s+(?!type\b)/.test(line)) continue
    if (!line.includes('from')) continue

    const match = line.match(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/)
    if (!match) continue

    const symbols = match[1]
      .split(',')
      .map((binding) => binding.trim().split(/\s+as\s+/)[0]?.trim())
      .filter((name): name is string => Boolean(name))

    imports.push({ symbols, from: match[2], line: index + 1 })
  }

  return imports
}

function resolveComponentImport(importPath: string, consumerFile: string): string | null {
  const consumerDir = dirname(consumerFile)
  const exts = ['.tsx', '.ts']

  if (importPath.startsWith('.')) {
    for (const ext of exts) {
      const candidate = join(consumerDir, `${importPath}${ext}`)
      if (existsSync(candidate)) return candidate
    }
    for (const ext of exts) {
      const candidate = join(consumerDir, importPath, `index${ext}`)
      if (existsSync(candidate)) return candidate
    }
    return null
  }

  if (importPath.includes('/components/')) {
    const suffix = importPath.split('/components/')[1]
    for (const ext of exts) {
      const candidate = join(componentsDir, `${suffix}${ext}`)
      if (existsSync(candidate)) return candidate
    }
  }

  return null
}

describe('issue #252 - data vs UI architecture boundaries', () => {
  it('resume-audit.test.ts does not import timelineEntries from TimelineSection', () => {
    const auditSource = readFileSync(join(srcDir, 'data', 'resume-audit.test.ts'), 'utf8')

    expect(auditSource).not.toMatch(
      /import\s+\{[^}]*\btimelineEntries\b[^}]*\}\s+from\s+['"]\.\.\/components\/TimelineSection['"]/,
    )
  })

  it('data, hooks, and test files do not value-import canonical datasets from render components', () => {
    const canonicalExportsByComponent = new Map<string, Set<string>>()

    for (const componentFile of collectRenderComponentFiles()) {
      const source = readFileSync(componentFile, 'utf8')
      const datasets = findExportedCanonicalDatasets(source)
      if (datasets.length > 0) {
        canonicalExportsByComponent.set(componentFile, new Set(datasets))
      }
    }

    const violations: string[] = []

    for (const consumerFile of collectBoundaryConsumerFiles()) {
      const source = readFileSync(consumerFile, 'utf8')
      const consumerLabel = relative(srcDir, consumerFile)

      for (const valueImport of parseValueImports(source)) {
        const resolved = resolveComponentImport(valueImport.from, consumerFile)
        if (!resolved) continue
        if (!resolved.endsWith('.tsx')) continue

        const exportedDatasets = canonicalExportsByComponent.get(resolved)
        if (!exportedDatasets) continue

        for (const symbol of valueImport.symbols) {
          if (exportedDatasets.has(symbol)) {
            violations.push(
              `${consumerLabel}:${valueImport.line} imports canonical dataset "${symbol}" from ${relative(srcDir, resolved)}`,
            )
          }
        }
      }
    }

    expect(violations).toEqual([])
  })
})
