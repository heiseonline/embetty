import { describe, expect, it } from 'bun:test'
import { LRU } from './lru'

describe('LRU.parse', () => {
  it.each([
    ['lru://max:500', { max: 500 }],
    ['lru://', { max: 100 }],
    ['lru://max:0', { max: 100 }],
    ['lru://max:abc', { max: 100 }],
    ['lru://ttl:5,max:20', { max: 20 }],
  ])('parses %s', (dsn, expected) => {
    expect(LRU.parse(dsn)).toEqual(expected)
  })
})
