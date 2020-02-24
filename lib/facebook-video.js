const Video = require('./video')

module.exports = class FacebookVideo extends Video {
  get _requestOptions() {
    return {
      uri: `https://www.facebook.com/${this.id}`
    }
  }

  get type() {
    return 'facebook'
  }

  get canonicalUrl() {
    return this._response.request.uri.href
  }

  get posterImageUrl() {
    return ``
  }

  toJSON() {
    return {
      canonicalUrl: this.canonicalUrl
    }
  }
}
