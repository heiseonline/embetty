import { LRUCache } from 'lru-cache'
import { CacheEntry, EmbettyCache } from './cache'

export class LRU implements EmbettyCache {
  #cache: LRUCache<string, CacheEntry>

  constructor(dsn: string) {
    const options = LRU.parse(dsn)
    options

    // this.#cache = new LRUCache(options as any)
    this.#cache = new LRUCache<string, CacheEntry>({ max: 100 })
  }

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.#cache.get(key) as CacheEntry<T> | undefined
  }

  set(entry: CacheEntry) {
    this.#cache.set(entry.key, entry)
  }

  static parse(string: string) {
    const options = {}
    const lruPattern = /^lru:\/\//

    if (!lruPattern.test(string)) {
      return options
    }

    string
      .replace(lruPattern, '')
      .split(',')
      .filter((e) => e.length > 0)
      .forEach((option) => {
        const [key, value] = option.split(':')
        if (key) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          options[key] = value
        }
      })
    return options
  }
}
