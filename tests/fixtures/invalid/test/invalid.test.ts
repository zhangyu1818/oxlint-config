import { describe, expect, it } from 'vitest'

describe.only('math', () => {
  it('adds values', () => {
    expect(1 + 1).toBe(2)
  })
})
