import debug_ from 'debug'
import { CacheEntry, EmbettyCache } from './cache/cache'
import { GuardedFetch } from './guarded-http-client'
import { hashRequest } from './util'

const debug = debug_('embetty-base:request-cache')

export type ResponseType = 'json' | 'text' | 'binary'

export interface RequestOptions {
  url: string
  params?: Readonly<Record<string, string>>
  headers?: Readonly<Record<string, string>>
  timeout?: number
  /** How to decode the body; defaults to `json`. */
  responseType?: ResponseType
}

export type CachedRequest = <T>(
  options: RequestOptions,
) => Promise<CacheEntry<T> | undefined>

/** The upstream answered, but not with what its API promises. */
export class InvalidUpstreamResponseError extends Error {
  override name = 'InvalidUpstreamResponseError'

  constructor(
    readonly url: string,
    reason: string,
  ) {
    super(`Invalid response from ${url}: ${reason}`)
  }
}

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
} satisfies Record<ResponseType, (response: Response) => Promise<unknown>>

const MEBIBYTE = 1_048_576
const MAX_IMAGE_BYTES = 10_485_760

// Documents are small; only images may use the client's full limit.
const MAX_BYTES = {
  binary: MAX_IMAGE_BYTES,
  text: MEBIBYTE,
  json: MEBIBYTE,
} satisfies Record<ResponseType, number>

export const cachedRequest =
  (cache: EmbettyCache, fetch: GuardedFetch): CachedRequest =>
  async <T>(options: RequestOptions): Promise<CacheEntry<T> | undefined> => {
    const url = new URL(options.url)
    for (const [name, value] of Object.entries(options.params ?? {})) {
      url.searchParams.set(name, value)
    }
    const responseType = options.responseType ?? 'json'

    // The same URL may be requested as an image and as JSON (a status URL
    // given as an avatar); one must not answer for the other.
    const key = hashRequest({ url: url.href, responseType })
    const debugId = `GET ${options.url} ["${key}"]`

    const cached = await cache.get<T>(key)
    if (cached) {
      debug(`Serving from cache: ${debugId} ...`)
      return cached
    }

    debug(`Requesting ${debugId} ...`)
    const response = await fetch(url, {
      headers: options.headers,
      timeout: options.timeout,
      maxBytes: MAX_BYTES[responseType],
      // Web pages are read for their <head>; JSON cut short would not parse.
      truncate: responseType === 'text',
    })
    if (!response.ok) {
      throw new HttpStatusError(response.status, options.url)
    }

    debug(`Caching ${debugId} ...`)
    const entry: CacheEntry<T> = {
      // The caller names the shape of the payload it requested.
      data: (await decoders[responseType](response).catch((error: unknown) => {
        throw new InvalidUpstreamResponseError(
          options.url,
          error instanceof Error ? error.message : String(error),
        )
      })) as T,
      headers: Object.fromEntries(response.headers),
      key,
      status: response.status,
    }

    await cache.set<T>(entry)

    return entry
  }
