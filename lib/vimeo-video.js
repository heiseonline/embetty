const Video = require('./video')

module.exports = class VimeoVideo extends Video {
  get _requestOptions() {
    return {
      uri: `http://vimeo.com/api/v2/video/${this.id}.json`,
      json: true,
    }
  }

  get posterImageUrl() {
    return this.data[0].thumbnail_large
  }
}
