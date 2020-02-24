const debug = require('debug')('embetty-base:embed')

const DEFAULT_REQUEST_TIMEOUT = 2000

module.exports = class Embed {
  constructor(id, { embetty, requestTimeout = DEFAULT_REQUEST_TIMEOUT } = {}) {
    this._retrieved = false
    this.embetty = embetty
    this.id = id
    this.requestTimeout = requestTimeout
  }

  async retrieve() {
    if (this._retrieved) return
    debug(`request: ${JSON.stringify(this._requestOptions)}`)
    this._response = await this.embetty.get(this._requestOptions.uri, {
      timeout: this.requestTimeout,
      ...this._requestOptions,
      // simple: false,
      headers: {
        'User-Agent': this.userAgentString,
      },
      resolveWithFullResponse: true,
    })
    this._retrieved = true
  }

  get userAgentString() {
    return 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
  }

  get data() {
    if (!this._retrieved) return undefined
    return this._response.body
  }

  toJSON() {
    return this._response.body
  }
}
