import BaseType from '../type'

const CSS = require('!css-loader!postcss-loader!sass-loader!./vimeo.scss').toString()

export class FacebookVideo extends BaseType {
  get css() {
    return CSS
  }

  get url() {
    return this.element._api(`/video/facebook/${this.element.videoId}`)
  }

  get posterImageUrl() {
    return '' // Poster image is not available for Facebook
  }

  get canonicalUrl() {
    return this.element._data.canonicalUrl
  }

  get iframeSrc() {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      this.canonicalUrl
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
