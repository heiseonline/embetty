import debug_ from 'debug'
import { CacheEntry, EmbettyCache } from './cache/cache'
import { GuardedFetch } from './guarded-http-client'
import { hashRequest } from './util'

const debug = debug_('embetty-base:request-cache')

export interface RequestOptions {
  url: string
  params?: Readonly<Record<string, string>>
  headers?: Readonly<Record<string, string>>
  timeout?: number
  /** How to decode the body; defaults to `json`. */
  responseType?: 'json' | 'text' | 'binary'
}

export type CachedRequest = <T>(
  options: RequestOptions,
) => Promise<CacheEntry<T> | undefined>

export class HttpStatusError extends Error {
  override name = 'HttpStatusError'

  constructor(
    readonly status: number,
    readonly url: string,
  ) {
    super(`Request failed with status code ${status}: ${url}`)
  }
}

const decoders = {
  binary: async (response) => Buffer.from(await response.arrayBuffer()),
  text: (response) => response.text(),
  json: (response): Promise<unknown> => response.json(),
} satisfies Record<
  NonNullable<RequestOptions['responseType']>,
  (response: Response) => Promise<unknown>
>

export const cachedRequest =
  (cache: EmbettyCache, fetch: GuardedFetch): CachedRequest =>
  async <T>(options: RequestOptions): Promise<CacheEntry<T> | undefined> => {
    const key = hashRequest(options)
    const debugId = `GET ${options.url} ["${key}"]`

    const cached = await cache.get<T>(key)
    if (cached) {
      debug(`Serving from cache: ${debugId} ...`)
      return cached
    }

    const url = new URL(options.url)
    for (const [name, value] of Object.entries(options.params ?? {})) {
      url.searchParams.set(name, value)
    }

    debug(`Requesting ${debugId} ...`)
    const response = await fetch(url, {
      headers: options.headers,
      timeout: options.timeout,
    })
    if (!response.ok) {
      throw new HttpStatusError(response.status, options.url)
    }

    debug(`Caching ${debugId} ...`)
    const entry: CacheEntry<T> = {
      // The caller names the shape of the payload it requested.
      data: (await decoders[options.responseType ?? 'json'](response)) as T,
      headers: Object.fromEntries(response.headers),
      key,
      status: response.status,
    }

    await cache.set<T>(entry)

    return entry
  }
