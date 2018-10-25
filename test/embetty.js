import { createElement } from './lib/util'
import { defineElement } from '../lib/util'
import assert from 'assert'
import Embed from '../lib/embed'

defineElement('embetty-test', class EmbettyTest extends Embed {
  get someApiUrl() {
    return this._api('/some-url')
  }

  async connectedCallback() {
    await super.connectedCallback()
    this.becomesVisible()
  }

  static get template() {
    return 'Embetty test'
  }
})

describe('Embetty', () => {
  it('should set the API url', async () => {
    const { element } = await createElement('embetty-test', { 'server-url': '/foo' })
    assert.strictEqual(element.serverUrl, '/foo')
    assert.strictEqual(element.someApiUrl, '/foo/some-url')
  })

  it('should use meta[data-embetty-server] as API url fallback', async () => {
    const meta = document.createElement('meta')
    meta.dataset.embettyServer = '/embetty-server'
    document.head.appendChild(meta)

    const { element } = await createElement('embetty-test')
    assert.strictEqual(element.serverUrl, '/embetty-server')
    assert.strictEqual(element.someApiUrl, '/embetty-server/some-url')

    meta.remove()
  })
})
