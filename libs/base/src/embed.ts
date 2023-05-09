import { AxiosRequestConfig } from 'axios'
import debug_ from 'debug'
import { CacheEntry } from './cache/cache'
import { Embetty } from './embetty'

const debug = debug_('embetty-base:embed')

const DEFAULT_REQUEST_TIMEOUT = 2000

export interface EmbedOptions<T> {
  embetty: Embetty<T>
  requestTimeout?: number
}

type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export type EmbettyRequest = MakeRequired<AxiosRequestConfig, 'url'>

export abstract class Embed<T, U = T> {
  _retrieved = false
  embetty: Embetty<T>
  id: string
  requestTimeout: number
  _response?: CacheEntry<T>

  abstract get _requestOptions(): EmbettyRequest | undefined

  constructor(
    id: string,
    { embetty, requestTimeout = DEFAULT_REQUEST_TIMEOUT }: EmbedOptions<T>,
  ) {
    this.embetty = embetty
    this.id = id
    this.requestTimeout = requestTimeout
  }

  async retrieve() {
    if (this._retrieved || !this._requestOptions) {
      return
    }

    debug(`request: ${JSON.stringify(this._requestOptions)}`)

    this._response = await this.embetty.get({
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
