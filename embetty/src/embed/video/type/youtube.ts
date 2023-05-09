import VideoImplementation from '../type'

const CSS =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
  require('!css-loader!postcss-loader!sass-loader!./youtube.scss').default.toString() as string

export class YoutubeVideo extends VideoImplementation<never> {
  get css() {
    return CSS
  }

  get posterImageUrl() {
    return this.element._api(
      `/video/youtube/${this.element.videoId}-poster-image`,
    )
  }

  get iframe() {
    return `
      <style>${this.css}</style>
      <div class="wrapper">
        <iframe
          id="ytplayer"
          width="${this.width}"
          height="${this.height}"
          src="//www.youtube-nocookie.com/embed/${this.element.videoId}?autoplay=1&start=${this.element.startAt}"
          frameborder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `
  }
}
