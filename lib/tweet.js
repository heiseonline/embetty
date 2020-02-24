const { env } = require('./util')
const cheerio = require('cheerio')
const debug = require('debug')('embetty-base:tweet')
const Embed = require('./embed')

module.exports = class Tweet extends Embed {
  constructor(id, options) {
    if (Number.isInteger(id)) throw new TypeError()
    super(id, options)
  }

  get _requestOptions() {
    return {
      uri: `https://api.twitter.com/1.1/statuses/show/${this.id}.json`,
      qs: {
        tweet_mode: 'extended',
      },
      oauth: {
        token: env('TWITTER_ACCESS_TOKEN_KEY'),
        token_secret: env('TWITTER_ACCESS_TOKEN_SECRET'),
        consumer_secret: env('TWITTER_CONSUMER_SECRET'),
        consumer_key: env('TWITTER_CONSUMER_KEY'),
      },
      json: true,
    }
  }

  get type() {
    return 'tweet'
  }

  get rateLimitRemaining() {
    return parseInt(this._response.headers['x-rate-limit-remaining'], 10)
  }

  get rateLimitReset() {
    const reset = parseInt(this._response.headers['x-rate-limit-reset'], 10) * 1000
    return new Date(reset)
  }

  get hasLinks() {
    return this.links.length > 0
  }

  get links() {
    try {
      return this.data.entities.urls
    } catch (e) {
      return []
    }
  }

  set links(links) {
    this.data.entities.urls = links
  }

  get profileImageUrl() {
    return this.data.user.profile_image_url.replace('_normal', '_bigger')
  }

  getProfileImage() {
    return this.embetty.getBinary(this.profileImageUrl)
  }

  async getImageUrl(idx = 0) {
    await this.retrieve()
    const image = this.data.extended_entities.media[idx]
    if (!image) return
    return image.media_url
  }

  async getImage(idx = 0) {
    const imageUrl = await this.getImageUrl(idx)
    if (!imageUrl) return
    return this.embetty.getBinary(imageUrl)
  }

  async _retrieveMeta(url) {
    let response
    try {
      response = await this.embetty.get(url, {
        resolveWithFullResponse: true,
      })
    } catch (e) {
      console.error('error in retrieving meta: ' + e.name + ': ' + e.message)
      return undefined
    }
    const $ = cheerio.load(response.body)
    return {
      url: response.request.uri.href,
      description: $('meta[name=description]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      title: $('title').text(),
    }
  }

  get linkImageUrl() {
    if (!this.hasLinks) return
    return this.links[0].image
  }

  getLinkImage() {
    const url = this.linkImageUrl
    if (!url) return
    return this.embetty.getBinary(url)
  }

  async _retrieveMetas() {
    this.links = (await Promise.all(
      this.links.map(l => this._retrieveMeta(l.expanded_url || l.url))
    )).filter(meta => typeof (meta) !== 'undefined')
  }

  async retrieve() {
    await super.retrieve()
    if (this.hasLinks) {
      debug('Retrieving link meta ...')
      this.urls = await this._retrieveMetas()
    }
  }
}
