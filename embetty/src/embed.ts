// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import EMBETTY_LOGO from '!raw-loader!../assets/embetty.svg'
import { Template } from 'hogan.js'
import { TEMPLATE_METADATA_KEY } from './decorators'

export abstract class Embed<T> extends HTMLElement {
  _fetched = false
  abstract get url(): string
  _data?: T

  get serverUrl() {
    const baseUrl = document.querySelector<HTMLElement>(
      'meta[data-embetty-server]',
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

  emit(name: string, data?: CustomEventInit<unknown> | undefined) {
    this.dispatchEvent(new window.CustomEvent(name, data))
  }

  on(name: string, cb: EventListenerOrEventListenerObject) {
    this.addEventListener(name, cb, false)
  }

  async becomesVisible() {
    if (this.url) {
      await this.fetchData()
    }

    this.shadowRoot!.innerHTML = this.render()

    this.emit('initialized')
  }

  connectedCallback() {
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
    const template = Reflect.get(this.constructor, TEMPLATE_METADATA_KEY) as
      | Template
      | undefined

    if (!template) {
      throw new Error(`Template not found for class ${this.constructor.name}`)
    }

    return template.render(this)
  }
}
