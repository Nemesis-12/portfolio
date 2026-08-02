import { describe, expect, it } from 'vitest'
import { isTypingDone, typedLength, typedText } from './typewriter'

describe('typedLength', () => {
  it('is 0 before any time has passed', () => {
    expect(typedLength('hello', 0)).toBe(0)
  })

  it('grows monotonically with elapsed time', () => {
    const text = 'a short tagline'
    expect(typedLength(text, 100)).toBeLessThanOrEqual(typedLength(text, 500))
  })

  it('never exceeds the text length', () => {
    expect(typedLength('hi', 100_000)).toBe(2)
  })
})

describe('typedText', () => {
  it('reveals a prefix of the string', () => {
    const text = 'I build things that are fun.'
    const partial = typedText(text, 45 * 5)
    expect(text.startsWith(partial)).toBe(true)
    expect(partial.length).toBe(5)
  })

  it('reveals the full string once enough time has passed', () => {
    const text = 'I build things that are fun.'
    expect(typedText(text, 100_000)).toBe(text)
  })
})

describe('isTypingDone', () => {
  it('is false partway through', () => {
    expect(isTypingDone('hello world', 45)).toBe(false)
  })

  it('is true once the full text has appeared', () => {
    expect(isTypingDone('hi', 1_000)).toBe(true)
  })
})
