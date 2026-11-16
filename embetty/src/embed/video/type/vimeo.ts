import { markup, raw } from '../../../html'
import VideoImplementation from '../type'
import CSS from '../../_video.css'

export class VimeoVideo extends VideoImplementation<never> {
  readonly idPattern = /^\d+$/

  get css() {
    return CSS
  }

  get posterImageUrl() {
    return this.element._api(
      `/video/vimeo/${this.element.videoId}-poster-image`,
    )
  }

  get iframe() {
    return markup`
      <style>${raw(CSS)}</style>
      <div class="wrapper">
        <iframe
          src="https://player.vimeo.com/video/${this.element.videoId}?autoplay=1#t=${this.element.startAt}"
          width="${this.width}"
          height="${this.height}"
          frameborder="0"
          webkitallowfullscreen
          mozallowfullscreen
          allowfullscreen
        ></iframe>
      </div>
    `
  }
}
