import { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios'

export interface CacheEntry<T = unknown> {
  key: string
  data: T | undefined
  headers: RawAxiosResponseHeaders | AxiosResponseHeaders
  status: number
}

export interface EmbettyCache {
  get<T>(
    key: string,
    // options: { isBinary?: boolean },
  ): Promise<CacheEntry<T> | undefined> | CacheEntry<T> | undefined

  set<T>(entry: CacheEntry<T>): Promise<void> | void

  disconnect?(): Promise<void> | void
}
