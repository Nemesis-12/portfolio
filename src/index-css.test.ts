/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const cssPath = join(dirname(fileURLToPath(import.meta.url)), 'index.css')
const css = readFileSync(cssPath, 'utf8')

function blockFor(selector: string) {
  const match = css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`))
  expect(match).not.toBeNull()
  return match?.[1] ?? ''
}

describe('global CSS brand chrome', () => {
  it('keeps canonical color tokens available', () => {
    expect(blockFor('@theme')).toContain('--color-graphite: #2A2B2A;')
    expect(blockFor('@theme')).toContain('--color-atomic-tangerine: #FF8547;')
    expect(css).toContain('--graphite: var(--color-graphite);')
    expect(css).toContain('--orange: var(--color-atomic-tangerine);')
  })

  it('uses orange and graphite tokens for scrollbar and selection styling', () => {
    expect(blockFor('::-webkit-scrollbar')).toContain('width: 8px;')
    expect(blockFor('::-webkit-scrollbar-track')).toContain('background: var(--graphite);')
    expect(blockFor('::-webkit-scrollbar-thumb')).toContain('background: var(--orange);')
    expect(blockFor('::selection')).toContain('background-color: var(--orange);')
    expect(blockFor('::selection')).toContain('color: var(--graphite);')
  })
})
