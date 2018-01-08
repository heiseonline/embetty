import BaseType from '../type'
import CSS from './youtube.scss'

export class YoutubeVideo extends BaseType {
  get css() {
    return CSS
  }

  get posterImageUrl() {
    return `/video/youtube/${this.element.videoId}/poster-image`
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
          src="http://www.youtube.com/embed/${this.element.videoId}?autoplay=1"
          frameborder="0"
        ></iframe>
      </div>
    `
  }
}
