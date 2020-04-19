import { createElement } from '../test/lib/util'
import { defineElement } from './util'
import assert from 'assert'
import Embed from './embed'

class EmbettyTest extends Embed {
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
}

defineElement('embetty-test', EmbettyTest)

describe('Embetty', () => {
  it('should set the API url', async () => {
    const { element } = await createElement<EmbettyTest>('embetty-test', {
      'server-url': '/foo',
    })
    assert.strictEqual(element.serverUrl, '/foo')
    assert.strictEqual(element.someApiUrl, '/foo/some-url')
  })

  it('should use meta[data-embetty-server] as API url fallback', async () => {
    const meta = document.createElement('meta')
    meta.dataset.embettyServer = '/embetty-server'
    document.head.append(meta)

    const { element } = await createElement<EmbettyTest>('embetty-test')
    assert.strictEqual(element.serverUrl, '/embetty-server')
    assert.strictEqual(element.someApiUrl, '/embetty-server/some-url')

    meta.remove()
  })
})
