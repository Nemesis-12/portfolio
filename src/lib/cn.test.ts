import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, '', 'b')).toBe('a b')
  })

  it('resolves conflicting Tailwind utilities in favour of the last one', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('supports conditional object syntax', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active')
  })
})
