
// @ts-ignore
import EMBETTY_LOGO from '!raw-loader!../assets/embetty.svg'

export default class Embed extends window.HTMLElement {
  _fetched = false
  url: any
  _data: any

  get serverUrl() {
    const baseUrl = document.querySelector<HTMLElement>(
      'meta[data-embetty-server]'
    )
    return (
      this.getAttribute('server-url') ||
      (baseUrl && baseUrl.dataset.embettyServer) ||
      ''
    )
  }

  isVisible() {
    return window.getComputedStyle(this).display !== 'none'
  }

  _api(url: string) {
    return this.serverUrl + url
  }

  emit(name: string, data?: any) {
    this.dispatchEvent(new window.CustomEvent(name, data))
  }

  on(name: string, cb: EventListenerOrEventListenerObject) {
    this.addEventListener(name, cb, false)
  }

  async becomesVisible() {
    if (this.url) await this.fetchData()
    this.shadowRoot!.innerHTML = this.render()

    this.emit('initialized')
  }

  async connectedCallback() {
    this.attachShadow({ mode: 'open' })
  }

  get wrapper() {
    return this.shadowRoot!.querySelector('.wrapper')
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
    // @ts-ignore
    return this.constructor.compiledTemplate.render(this)
  }
}
