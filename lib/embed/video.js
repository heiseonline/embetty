import * as Videos from './video/types'
import {defineElement} from '../util'
import Embed from '../embed'
import Observable from '../observable'

const CSS = require('!css-loader!postcss-loader!sass-loader!./_video.scss').toString()

export default class Video extends Observable(Embed) {
  async connectedCallback() {
    this.impl = new this.Type(this)
    await super.connectedCallback()
    this.playButton.addEventListener('click', e => {
      this.activate()
    }, { once: true })
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

  get Type() {
    const className = this.typeClass
    if (!Videos.hasOwnProperty(this.typeClass)) {
      console.error(`"${className}" does not exist.`)
      return
    }
    return Videos[className]
  }

  get typeClass() {
    return this.type.charAt(0).toUpperCase() + this.type.slice(1) + 'Video'
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

  static get css() {
    return CSS
  }

  static get template() {
    return `
      <style>${CSS}</style>
      <button type="button" id="playbutton">
        <svg viewBox="0 0 200 200" id="playicon">
          <circle cx="100" cy="100" r="90" fill="none" stroke-width="15" stroke="#fff"/>
          <polygon points="70, 55 70, 145 145, 100" fill="#fff"/>
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
