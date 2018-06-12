const Video = require('./video')

module.exports = class YoutubeVideo extends Video {
  get type() {
    return 'youtube'
  }

  get posterImageUrl() {
    return `https://img.youtube.com/vi/${this.id}/hqdefault.jpg`
  }
}
