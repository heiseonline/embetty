import { LRUCache } from 'lru-cache'
import { CacheEntry, EmbettyCache } from './cache'

const DEFAULT_MAX_ENTRIES = 100

export interface LRUOptions {
  max: number
}

export class LRU implements EmbettyCache {
  #cache: LRUCache<string, CacheEntry>

  constructor(dsn: string) {
    this.#cache = new LRUCache<string, CacheEntry>(LRU.parse(dsn))
  }

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.#cache.get(key) as CacheEntry<T> | undefined
  }

  set(entry: CacheEntry) {
    this.#cache.set(entry.key, entry)
  }

  /** Parses `lru://max:500`; unknown or invalid options fall back to defaults. */
  static parse(dsn: string): LRUOptions {
    const params = new Map<string, string>()
    for (const option of dsn.replace(/^lru:\/\//, '').split(',')) {
      const [key, value] = option.split(':')
      if (key && value !== undefined) {
        params.set(key, value)
      }
    }
    const max = Number(params.get('max'))

    return {
      max: Number.isInteger(max) && max > 0 ? max : DEFAULT_MAX_ENTRIES,
    }
  }
}
