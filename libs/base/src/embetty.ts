import debug_ from 'debug'
import { CacheEntry, EmbettyCache } from './cache/cache'
import { LRU } from './cache/lru'
import { Redis } from './cache/redis'
import { Embed, EmbedOptions } from './embed'
import { FacebookVideo } from './facebook-video'
import { createGuardedFetch, GuardedFetch } from './guarded-http-client'
import { MastodonStatus } from './mastodon'
import { CachedRequest, cachedRequest, RequestOptions } from './request-cache'
import { Tweet } from './twitter/tweet'
import { VimeoVideo } from './vimeo-video'
import { YoutubeVideo } from './youtube-video'

const debug = debug_('embetty-base:embetty')

// Images are served from Embetty's own origin, so anything a browser might
// execute (text/html, image/svg+xml, ...) must never pass through.
const IMAGE_CONTENT_TYPES: ReadonlySet<string> = new Set([
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
])

// "image/png; charset=binary" -> "image/png"; types are case-insensitive.
const mediaType = (header = 'application/octet-stream') =>
  (header.split(';')[0] ?? '').trim().toLowerCase()

export class UnsupportedContentTypeError extends Error {
  override name = 'UnsupportedContentTypeError'

  constructor(readonly contentType: string) {
    super(`Unsupported content type: ${contentType}`)
  }
}

// Deleted posts disappear from embeds within a day.
const DEFAULT_CACHE_TTL = 86_400

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassOf<T> = new (...args: any[]) => T

export class Embetty {
  cache: EmbettyCache
  request: CachedRequest

  constructor(
    cache: EmbettyCache = Embetty.createCache(),
    fetch: GuardedFetch = createGuardedFetch(),
  ) {
    this.cache = cache
    this.request = cachedRequest(this.cache, fetch)
  }

  async close() {
    if (this.cache.disconnect) {
      await this.cache.disconnect()
    }
  }

  async get<T>(options: RequestOptions): Promise<CacheEntry<T> | undefined> {
    debug(`GET ${options.url} ...`)
    return this.request<T>(options)
  }

  async getBinary(options: RequestOptions) {
    const response = await this.get<Buffer>({
      ...options,
      responseType: 'binary',
    })

    if (!response) {
      return undefined
    }

    return {
      data: response.data,
      type: mediaType(response.headers['content-type']),
    }
  }

  async getImage(options: RequestOptions) {
    const binary = await this.getBinary(options)

    if (binary && !IMAGE_CONTENT_TYPES.has(binary.type)) {
      throw new UnsupportedContentTypeError(binary.type)
    }

    return binary
  }

  async loadEmbed<T extends Embed<unknown, unknown>>(
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

  loadTweet(id: string, options?: EmbedOptions): Promise<Tweet> {
    return this.loadEmbed(Tweet, id, options)
  }

  loadYoutubeVideo(id: string, options?: EmbedOptions): Promise<YoutubeVideo> {
    return this.loadEmbed(YoutubeVideo, id, options)
  }

  loadVimeoVideo(id: string, options?: EmbedOptions): Promise<VimeoVideo> {
    return this.loadEmbed(VimeoVideo, id, options)
  }

  loadFacebookVideo(id: string, options?: EmbedOptions) {
    return this.loadEmbed(FacebookVideo, id, options)
  }

  loadMastodonStatus(
    id: string,
    options?: EmbedOptions,
  ): Promise<MastodonStatus> {
    return this.loadEmbed(MastodonStatus, id, options)
  }

  static get cacheEngines(): Record<string, ClassOf<EmbettyCache>> {
    return { Redis, LRU }
  }

  static createCache(): EmbettyCache {
    const dsn = process.env.EMBETTY_CACHE || 'lru://'
    const ttl = Number(process.env.EMBETTY_CACHE_TTL)
    if (process.env.EMBETTY_CACHE_TTL && !(Number.isInteger(ttl) && ttl > 0)) {
      // Redis only takes whole seconds; failing here beats failing every set.
      throw new Error(
        `EMBETTY_CACHE_TTL must be a positive number of seconds, got ${process.env.EMBETTY_CACHE_TTL}`,
      )
    }
    const wantedEngine = dsn.match(/(\w+):\/\//)?.[1]

    const Engine = Object.keys(Embetty.cacheEngines)
      .filter((name) => name.toLowerCase() === wantedEngine)
      .map((name) => Embetty.cacheEngines[name])[0]

    if (!Engine) {
      throw new Error(`Unsupported cache engine: ${wantedEngine ?? '(none)'}`)
    }

    debug(`Using ${Engine.name} cache ...`)
    return new Engine(dsn, { ttl: ttl || DEFAULT_CACHE_TTL })
  }
}
