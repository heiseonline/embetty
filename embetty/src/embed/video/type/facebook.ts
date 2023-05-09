import VideoImplementation from '../type'

const CSS =
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
  require('!css-loader!postcss-loader!sass-loader!./vimeo.scss').default.toString() as string

export class FacebookVideo extends VideoImplementation<{
  canonicalUrl: string
}> {
  get css() {
    return CSS
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get url() {
    return this.element._api(`/video/facebook/${this.element.videoId}`)
  }

  get posterImageUrl() {
    return '' // Poster image is not available for Facebook
  }

  get canonicalUrl() {
    return this.element._data?.canonicalUrl
  }

  get iframeSrc() {
    if (!this.canonicalUrl) {
      throw new Error('canonicalUrl is not available')
    }

    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      this.canonicalUrl,
    )}&show_text=0&autoplay=1&mute=0&width=${this.width}`
  }

  get iframe() {
    return `
      <style>${CSS}</style>
      <div class="wrapper">
        <iframe
          src="${this.iframeSrc}"
          width="${this.width}"
          height="${this.height}"
          style="border:none;overflow:hidden"
          scrolling="no"
          frameborder="0"
          allowTransparency="true"
          allowFullScreen="true"
        ></iframe>
      </div>
    `
  }
}
