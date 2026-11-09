import { AxiosInstance, AxiosRequestConfig } from 'axios'
import debug_ from 'debug'
import { CacheEntry, EmbettyCache } from './cache/cache'
import { hashRequest } from './util'

const debug = debug_('embetty-base:request-cache')

export type EmbettyRequest<T> = (
  options: AxiosRequestConfig,
) => Promise<CacheEntry<T> | undefined>

export const cachedRequest = <T>(
  cache: EmbettyCache,
  http: AxiosInstance,
): EmbettyRequest<T> => {
  return async (
    options: AxiosRequestConfig,
  ): Promise<CacheEntry<T> | undefined> => {
    const key = hashRequest(options)
    const debugId = `${options.method || 'GET'} ${
      options.url ?? '(unknown)'
    } ["${key}"]`

    let value: CacheEntry<T> | undefined = await cache.get<T>(key)

    if (value) {
      debug(`Serving from cache: ${debugId} ...`)
      return value
    }

    debug(`Requesting ${debugId} ...`)
    const response = await http.request<T>(options)

    debug(`Caching ${debugId} ...`)
    value = {
      data: response.data,
      headers: response.headers,
      key,
      status: response.status,
    }

    await cache.set<T>(value)

    return value
  }
}
