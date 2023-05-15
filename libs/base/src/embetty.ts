import { MastodonStatusData } from '@embetty/types'
import { AxiosRequestConfig } from 'axios'
import contentType from 'content-type'
import debug_ from 'debug'
import { TweetResponse } from '../../types/src/tweet.interfaces'
import { CacheEntry, EmbettyCache } from './cache/cache'
import { LRU } from './cache/lru'
import { Redis } from './cache/redis'
import { Embed, EmbedOptions } from './embed'
import { FacebookVideo, FacebookVideoData } from './facebook-video'
import { MastodonStatus } from './mastodon'
import { EmbettyRequest, cachedRequest } from './request-cache'
import { Tweet } from './twitter/tweet'
import { VimeoVideo, VimeoVideoData } from './vimeo-video'
import { YoutubeVideo, YoutubeVideoData } from './youtube-video'

const debug = debug_('embetty-base:embetty')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassOf<T> = new (...args: any[]) => T

export class Embetty<T> {
  cache: EmbettyCache
  request: EmbettyRequest<T>

  constructor(cache: EmbettyCache = Embetty.createCache()) {
    this.cache = cache
    this.request = cachedRequest(this.cache)
  }

  async close() {
    if (this.cache.disconnect) {
      await this.cache.disconnect()
    }
  }

  async get<T>(
    options: AxiosRequestConfig = {},
  ): Promise<CacheEntry<T> | undefined> {
    debug(`GET ${options.url ?? '(unknown)'} ...`)
    return this.request(options) as Promise<CacheEntry<T> | undefined>
  }

  async getBinary<T>(options: AxiosRequestConfig) {
    const response = await this.get<T>({
      ...options,
      responseType: 'arraybuffer',
    })

    if (!response) {
      return undefined
    }

    return {
      data: response.data,
      type: contentType.parse(response.headers['content-type'] as string).type,
    }
  }

  async loadEmbed<T extends Embed<any>>(
    Class: ClassOf<T>,
    id: string,
    options = {},
  ): Promise<T> {
    const embed = new Class(id, {
      embetty: this,
      ...options,
    })

    await embed.retrieve()

    return embed
  }

  loadTweet(id: string, options?: EmbedOptions<TweetResponse>): Promise<Tweet> {
    return this.loadEmbed(Tweet, id, options)
  }

  loadYoutubeVideo(
    id: string,
    options?: EmbedOptions<YoutubeVideoData>,
  ): Promise<YoutubeVideo> {
    return this.loadEmbed(YoutubeVideo, id, options)
  }

  loadVimeoVideo(
    id: string,
    options?: EmbedOptions<VimeoVideoData>,
  ): Promise<VimeoVideo> {
    return this.loadEmbed(VimeoVideo, id, options)
  }

  loadFacebookVideo(id: string, options?: EmbedOptions<FacebookVideoData>) {
    return this.loadEmbed(FacebookVideo, id, options)
  }

  loadMastodonStatus(
    id: string,
    options?: EmbedOptions<MastodonStatusData>,
  ): Promise<MastodonStatus> {
    return this.loadEmbed(MastodonStatus, id, options)
  }

  static get cacheEngines(): Record<string, ClassOf<EmbettyCache>> {
    return { Redis, LRU }
  }

  static createCache(): EmbettyCache {
    const dsn = process.env.EMBETTY_CACHE || 'lru://max:100'
    const wantedEngine = dsn.match(/(\w+):\/\//)?.[1]

    const Engine = Object.keys(Embetty.cacheEngines)
      .filter((name) => name.toLowerCase() === wantedEngine)
      .map((name) => Embetty.cacheEngines[name])[0]

    if (!Engine) {
      throw new Error(`Unsupported cache engine: ${wantedEngine ?? '(none)'}`)
    }

    debug(`Using ${Engine.name} cache ...`)
    return new Engine(dsn)
  }
}
