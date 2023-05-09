import axios, { AxiosRequestConfig } from 'axios'
import debug_ from 'debug'
import { Agent as HttpAgent } from 'http'
import { Agent as HttpsAgent } from 'https'
import { CacheEntry, EmbettyCache } from './cache/cache'
import { hashRequest } from './util'

const debug = debug_('embetty-base:request-cache')

export type EmbettyRequest<T> = (
  options: AxiosRequestConfig,
) => Promise<CacheEntry<T> | undefined>

export const http = axios.create({
  httpAgent: new HttpAgent({ keepAlive: true }),
  httpsAgent: new HttpsAgent({ keepAlive: true }),
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
  },
})

export const cachedRequest = <T>(cache: EmbettyCache): EmbettyRequest<T> => {
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
    const response = await axios.request<T>(options)

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
