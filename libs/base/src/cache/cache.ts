export interface CacheEntry<T = unknown> {
  key: string
  data: T | undefined
  /** Lower-cased names. */
  headers: Readonly<Record<string, string>>
  status: number
}

export interface CacheOptions {
  /** Seconds after which an entry is fetched again. */
  ttl: number
}

export interface EmbettyCache {
  get<T>(
    key: string,
  ): Promise<CacheEntry<T> | undefined> | CacheEntry<T> | undefined

  set<T>(entry: CacheEntry<T>): Promise<void> | void

  disconnect?(): Promise<void> | void
}
