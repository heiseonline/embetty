import { describe, expect, it } from 'bun:test'
import { CacheEntry } from './cache'
import { LRU } from './lru'

describe('LRU.parse', () => {
  it.each([
    ['lru://max:500', { max: 500, maxSize: 64 }],
    ['lru://', { max: 100, maxSize: 64 }],
    ['lru://max:0', { max: 100, maxSize: 64 }],
    ['lru://max:abc', { max: 100, maxSize: 64 }],
    ['lru://ttl:5,max:20', { max: 20, maxSize: 64 }],
    ['lru://maxSize:8', { max: 100, maxSize: 8 }],
  ])('parses %s', (dsn, expected) => {
    expect(LRU.parse(dsn)).toEqual(expected)
  })
})

describe(LRU.name, () => {
  const entry = (key: string, bytes: number): CacheEntry => ({
    key,
    data: Buffer.alloc(bytes),
    headers: {},
    status: 200,
  })

  it('evicts the oldest entries beyond maxSize', () => {
    const cache = new LRU('lru://maxSize:2', { ttl: 60 })

    cache.set(entry('a', 1_048_576))
    cache.set(entry('b', 1_048_576))
    cache.set(entry('c', 1_048_576))

    expect(['a', 'b', 'c'].map((key) => cache.get(key) !== undefined)).toEqual([
      false,
      true,
      true,
    ])
  })
})
