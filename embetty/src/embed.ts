import EMBETTY_LOGO from '../assets/embetty.svg' with { type: 'text' }
import { Html } from './html'

export class EmbedLoadError extends Error {
  override name = 'EmbedLoadError'

  constructor(
    readonly url: string,
    readonly status: number,
  ) {
    super(`Embetty server answered ${status} for ${url}`)
  }
}

export abstract class Embed<T> extends HTMLElement {
  _fetched = false
  abstract get url(): string | undefined
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

  emit(name: string, data?: CustomEventInit<unknown>) {
    this.dispatchEvent(new window.CustomEvent(name, data))
  }

  on(name: string, cb: EventListenerOrEventListenerObject) {
    this.addEventListener(name, cb, false)
  }

  async becomesVisible() {
    const { url } = this
    if (url) {
      await this.fetchData(url)
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

  async fetchData(url: string) {
    const response = await window.fetch(url)
    if (!response.ok) {
      throw new EmbedLoadError(url, response.status)
    }

    this._data = (await response.json()) as T
    this._fetched = true
  }

  abstract template(): Html

  render() {
    return this.template().value
  }
}
