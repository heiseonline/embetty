const Video = require('./video')

module.exports = class VimeoVideo extends Video {
  get _requestOptions() {
    return {
      uri: `https://vimeo.com/api/v2/video/${this.id}.json`,
      json: true,
    }
  }

  get type() {
    return 'vimeo'
  }

  get posterImageUrl() {
    return this.data[0].thumbnail_large
  }
}
