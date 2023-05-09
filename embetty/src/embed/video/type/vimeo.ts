import VideoImplementation from '../type'

const CSS =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
  require('!css-loader!postcss-loader!sass-loader!./vimeo.scss').default.toString() as string

export class VimeoVideo extends VideoImplementation<never> {
  get css() {
    return CSS
  }

  get posterImageUrl() {
    return this.element._api(
      `/video/vimeo/${this.element.videoId}-poster-image`,
    )
  }

  get iframe() {
    return `
      <style>${CSS}</style>
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
