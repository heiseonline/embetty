import { wait } from './util'
import urljoin from 'url-join'

// eslint-disable-next-line
import EMBETTY_LOGO from '!raw-loader!../assets/embetty.svg'

export default class Embed extends window.HTMLElement {
  constructor() {
    super()
    this._fetched = false
  }

  get serverUrl() {
    const baseUrl = document.querySelector('meta[data-embetty-server]')
    return this.getAttribute('server-url') ||
      (baseUrl && baseUrl.dataset.embettyServer) ||
      ''
  }

  isVisible() {
    return window.getComputedStyle(this).display !== 'none'
  }

  _api(url) {
    return urljoin(this.serverUrl, url)
  }

  emit(name, data) {
    this.dispatchEvent(new window.CustomEvent(name, data))
  }

  on(name, cb) {
    this.addEventListener(name, cb, false)
  }

  async becomesVisible() {
    if (this.url) await this.fetchData()
    this.shadowRoot.innerHTML = this.render()

    await wait() // wait for ShadyDOM to render
    window.ShadyCSS.styleElement(this)
    this.emit('initialized')
  }

  async connectedCallback() {
    this.attachShadow({ mode: 'open' })
    await wait()
  }

  get wrapper() {
    return this.shadowRoot.querySelector('.wrapper')
  }

  get embettyLogo() {
    return EMBETTY_LOGO
  }

  async fetchData() {
    const _response = await window.fetch(this.url)
    this._data = await _response.json()
    this._fetched = true
  }

  render() {
    return this.constructor.compiledTemplate.render(this)
  }
}
