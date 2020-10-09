const Video = require('./video')

module.exports = class YoutubeVideo extends Video {
  get _requestOptions() {
    return {
      uri: this.posterMaxResImageUrl,
      method: 'HEAD',
      simple: false,
    }
  }

  get type() {
    return 'youtube'
  }

  get posterMaxResImageUrl() {
    return `https://img.youtube.com/vi/${this.id}/maxresdefault.jpg`
  }

  get posterMaxResImageIsAvailable() {
    return this._response.statusCode === 200
  }

  get posterImageUrl() {
    if (this.posterMaxResImageIsAvailable) return this.posterMaxResImageUrl

    return `https://img.youtube.com/vi/${this.id}/hqdefault.jpg`
  }
}
