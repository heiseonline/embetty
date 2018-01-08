import * as Videos from './video/'
import {defineElement} from '../util'
import Embed from '../embed'

export default class Video extends Embed {
  connectedCallback() {
    this.impl = new this.Type(this)
    this.addEventListener('click', e => { this.activate() }, { once: true })
    super.connectedCallback()
  }

  activate() {
    this.shadowRoot.innerHTML = this.impl.iframe
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

  get css() {
    return this.impl.css
  }

  static get template() {
    return `
      <style>{{css}}</style>
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke-width="15" stroke="#fff"/>
        <polygon points="70, 55 70, 145 145, 100" fill="#fff"/>
      </svg>
      <div id="poster">
        <img src="{{posterImageUrl}}">
      </div>
    `
  }
}

defineElement('embetty-video', Video)
