import BaseType from '../type'

// eslint-disable-next-line
const CSS = require('!css-loader!postcss-loader!sass-loader!./vimeo.scss').toString()

export class FacebookVideo extends BaseType {
  get css() {
    return CSS
  }

  get url() {
    return this.element._api(`/video/facebook/${this.element.videoId}`)
  }

  get posterImageUrl() {
    return `${this.url}-poster-image`
  }

  get canonicalUrl() {
    return this.element._data.canonicalUrl
  }

  get iframeSrc() {
    return 'https://www.facebook.com/plugins/video.php?href=' +
      encodeURIComponent(this.canonicalUrl) +
      `&show_text=0&width=${this.width}`
  }

  get iframe() {
    return `
      <style>${this.css}</style>
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
