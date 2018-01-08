import {wait} from './util'

export default class Embed extends window.HTMLElement {
  constructor() {
    super()
    this._fetched = false
  }

  emit(name, data) {
    this.dispatchEvent(new window.CustomEvent(name, data))
  }

  on(name, cb) {
    this.addEventListener(name, cb, false)
  }

  async connectedCallback() {
    this.attachShadow({mode: 'open'})
    if (this.shadowRootAttached) this.shadowRootAttached()

    if (this.url) await this.fetchData()
    this.shadowRoot.innerHTML = this.render()

    await wait() // wait for ShadyDOM to render
    window.ShadyCSS.styleElement(this)
    this.emit('initialized')
  }

  get wrapper() {
    return this.shadowRoot.querySelector('.wrapper')
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
