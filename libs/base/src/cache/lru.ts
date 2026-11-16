import { LRUCache } from 'lru-cache'
import { CacheEntry, CacheOptions, EmbettyCache } from './cache'

const DEFAULT_MAX_ENTRIES = 100
const DEFAULT_MAX_MEBIBYTES = 64
const MEBIBYTE = 1_048_576
const MILLISECONDS = 1000

export interface LRUOptions {
  max: number
  /** Upper bound of all entries' payloads in MiB. */
  maxSize: number
}

// Images are kept as buffers; everything else is approximated by its JSON.
const payloadSize = ({ data }: CacheEntry) =>
  Math.max(
    1,
    Buffer.isBuffer(data)
      ? data.byteLength
      : Buffer.byteLength(JSON.stringify(data) ?? ''),
  )

export class LRU implements EmbettyCache {
  #cache: LRUCache<string, CacheEntry>

  constructor(dsn: string, { ttl }: CacheOptions) {
    const { max, maxSize } = LRU.parse(dsn)
    this.#cache = new LRUCache<string, CacheEntry>({
      max,
      maxSize: maxSize * MEBIBYTE,
      sizeCalculation: payloadSize,
      ttl: ttl * MILLISECONDS,
    })
  }

  get<T>(key: string): CacheEntry<T> | undefined {
    return this.#cache.get(key) as CacheEntry<T> | undefined
  }

  set(entry: CacheEntry) {
    this.#cache.set(entry.key, entry)
  }

  /**
   * Parses `lru://max:500,maxSize:128`; unknown or invalid options fall back
   * to defaults.
   */
  static parse(dsn: string): LRUOptions {
    const params = new Map<string, string>()
    for (const option of dsn.replace(/^lru:\/\//, '').split(',')) {
      const [key, value] = option.split(':')
      if (key && value !== undefined) {
        params.set(key, value)
      }
    }
    const positive = (name: string, fallback: number) => {
      const value = Number(params.get(name))
      return Number.isInteger(value) && value > 0 ? value : fallback
    }

    return {
      max: positive('max', DEFAULT_MAX_ENTRIES),
      maxSize: positive('maxSize', DEFAULT_MAX_MEBIBYTES),
    }
  }
}
