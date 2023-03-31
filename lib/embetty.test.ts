import { createElement } from '../test/lib/util'
import Embed from './embed'
import { webcomponent } from './decorators'

@webcomponent('embetty-test')
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

describe('Embetty', () => {
  it('should set the API url', async () => {
    const { element } = await createElement<EmbettyTest>('embetty-test', {
      'server-url': '/foo',
    })
    expect(element.serverUrl).toBe('/foo')
    expect(element.someApiUrl).toBe('/foo/some-url')
  })

  it('should use meta[data-embetty-server] as API url fallback', async () => {
    const meta = document.createElement('meta')
    meta.dataset.embettyServer = '/embetty-server'
    document.head.append(meta)

    const { element } = await createElement<EmbettyTest>('embetty-test')
    expect(element.serverUrl).toBe('/embetty-server')
    expect(element.someApiUrl).toBe('/embetty-server/some-url')

    meta.remove()
  })
})
