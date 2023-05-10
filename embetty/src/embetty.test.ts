import { webcomponent } from './decorators'
import { Embed } from './embed'
import { createElement } from './test/lib/util'

@webcomponent('embetty-test', '')
class EmbettyTest extends Embed<unknown> {
  url = '/'

  get someApiUrl() {
    return this._api('/some-url')
  }

  override connectedCallback() {
    super.connectedCallback()
    void this.becomesVisible()
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
