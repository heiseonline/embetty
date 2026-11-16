import debug_ from 'debug'
import { CacheEntry } from './cache/cache'
import { Embetty } from './embetty'
import { RequestOptions } from './request-cache'

const debug = debug_('embetty-base:embed')

const DEFAULT_REQUEST_TIMEOUT = 2000

export interface EmbedOptions {
  embetty: Embetty
  requestTimeout?: number
}

export type EmbettyRequest = RequestOptions

export abstract class Embed<T, U = T> {
  _retrieved = false
  embetty: Embetty
  id: string
  requestTimeout: number
  _response?: CacheEntry<T>

  abstract get _requestOptions(): EmbettyRequest | undefined

  constructor(
    id: string,
    { embetty, requestTimeout = DEFAULT_REQUEST_TIMEOUT }: EmbedOptions,
  ) {
    this.embetty = embetty
    this.id = id
    this.requestTimeout = requestTimeout
  }

  async retrieve() {
    if (this._retrieved || !this._requestOptions) {
      return
    }

    // Only the URL: the options may carry credentials (Twitter token).
    debug(`request: ${this._requestOptions.url}`)

    this._response = await this.embetty.get<T>({
      timeout: this.requestTimeout,
      ...this._requestOptions,
    })

    this._retrieved = true
  }

  get data() {
    return this._response?.data
  }

  toJSON(): U {
    return this._response?.data as U
  }
}
