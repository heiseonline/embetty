const cachedRequest = require('./request-cache')
const contentType = require('content-type')
const debug = require('debug')('embetty-base:embetty')
const FacebookVideo = require('./facebook-video')
const LRU = require('../lib/cache/lru')
const Redis = require('../lib/cache/redis')
const Tweet = require('./tweet')
const VimeoVideo = require('./vimeo-video')
const YoutubeVideo = require('./youtube-video')

module.exports = class Embetty {
  constructor(cache) {
    if (typeof cache !== 'object') cache = Embetty.createCache()
    this.cache = cache
    this.request = cachedRequest(this.cache)
  }

  close() {
    try {
      this.cache.disconnect()
    } catch (error) {
      // ignore
    }
  }

  get(url, options = {}) {
    debug(`GET ${url} ...`)
    options.uri = url
    return this.request(options)
  }

  async getBinary(url, options = { resolveWithFullResponse: true }) {
    options.encoding = null
    const response = await this.get(url, options)
    return {
      data: response.body,
      type: contentType.parse(response).type,
    }
  }

  async loadEmbed(Class, id, options = {}) {
    options.embetty = this
    const embed = new Class(id, options)
    await embed.retrieve()
    return embed
  }

  loadTweet(id, options) {
    return this.loadEmbed(Embetty.Tweet, id, options)
  }

  loadYoutubeVideo(id, options) {
    return this.loadEmbed(Embetty.YoutubeVideo, id, options)
  }

  loadVimeoVideo(id, options) {
    return this.loadEmbed(Embetty.VimeoVideo, id, options)
  }

  loadFacebookVideo(id, options) {
    return this.loadEmbed(Embetty.FacebookVideo, id, options)
  }

  static get cacheEngines() {
    return { Redis, LRU }
  }

  static createCache() {
    const connection = process.env.EMBETTY_CACHE || 'lru://max:100'
    const wantedEngine = connection.match(/(\w+):\/\//)[1]

    const Engine = Object.keys(Embetty.cacheEngines)
      .filter((name) => name.toLowerCase() === wantedEngine)
      .map((name) => Embetty.cacheEngines[name])[0]

    if (!Engine) throw new Error(`Unsupported cache engine: ${wantedEngine}`)

    debug(`Using ${Engine.name} cache ...`)
    return new Engine(connection)
  }

  static get Tweet() {
    return Tweet
  }

  static get YoutubeVideo() {
    return YoutubeVideo
  }

  static get VimeoVideo() {
    return VimeoVideo
  }

  static get FacebookVideo() {
    return FacebookVideo
  }
}
