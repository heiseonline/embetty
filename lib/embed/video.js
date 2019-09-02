import { defineElement } from '../util'
import Embed from '../embed'
import Observable from '../observable'

// eslint-disable-next-line
const CSS = require('!css-loader!postcss-loader!sass-loader!./_video.scss').toString()

export default class Video extends Observable(Embed) {
  async connectedCallback() {
    const Class = (await import(`./video/type/${this.type}`)).default
    this.impl = new Class(this)
    await super.connectedCallback()
    this.playButton.addEventListener(
      'click',
      e => {
        this.activate()
      },
      { once: true }
    )
  }

  activate() {
    this.shadowRoot.innerHTML = this.impl.iframe
    this.emit('activated')
  }

  get playButton() {
    return this.shadowRoot.querySelector('#playbutton')
  }

  get url() {
    return this.impl.url
  }

  get type() {
    return this.getAttribute('type')
  }

  get videoId() {
    return this.getAttribute('video-id')
  }

  get posterImageUrl() {
    return this.impl.posterImageUrl
  }

  get startAt() {
    return this.getAttribute('start-at') || 0
  }

  static get css() {
    return CSS
  }

  static get template() {
    return `
      <style>${CSS}</style>
      <button type="button" id="playbutton">
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 48 48" fill="#fff">
          <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm-4 29V15l12 9-12 9z"/>
        </svg>
      </button>
      <div id="poster">
        <img src="{{posterImageUrl}}">
      </div>
      <a href="https://www.heise.de/embetty" target="_blank" rel="noopener" id="powered-by" title="embetty - displaying remote content without compromising your privacy.">
        powered by {{{embettyLogo}}}
      </a>
    `
  }
}

defineElement('embetty-video', Video)
