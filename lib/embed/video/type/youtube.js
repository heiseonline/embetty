import BaseType from '../type'

// eslint-disable-next-line
const CSS = require('!css-loader!postcss-loader!sass-loader!./youtube.scss').toString()

export class YoutubeVideo extends BaseType {
  get css() {
    return CSS
  }

  get posterImageUrl() {
    return this.element._api(`/video/youtube/${this.element.videoId}-poster-image`)
  }

  get iframe() {
    return `
      <style>${this.css}</style>
      <div class="wrapper">
        <iframe
          id="ytplayer"
          type="text/html"
          width="${this.width}"
          height="${this.height}"
          src="//www.youtube-nocookie.com/embed/${this.element.videoId}?autoplay=1&start=${this.element.startAt}"
          frameborder="0"
        ></iframe>
      </div>
    `
  }
}
