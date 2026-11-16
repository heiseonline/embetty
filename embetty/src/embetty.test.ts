// @vitest-environment happy-dom
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test'
import { webcomponent } from './decorators'
import { Embed, EmbedLoadError } from './embed'
import { markup } from './html'
import { createElement, mockServerResponse } from './test/lib/util'

@webcomponent('embetty-test')
class EmbettyTest extends Embed<unknown> {
  url = '/'

  get someApiUrl() {
    return this._api('/some-url')
  }

  override connectedCallback() {
    super.connectedCallback()
    void this.becomesVisible()
  }

  template() {
    return markup`Embetty test`
  }
}

beforeEach(() => {
  mockServerResponse({})
})

afterEach(() => {
  mock.restore()
})

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

  it('loads its data from the server', async () => {
    mockServerResponse({ hello: 'world' })
    const { element } = await createElement<EmbettyTest>('embetty-test')

    await element.becomesVisible()

    expect(element._data).toEqual({ hello: 'world' })
    expect(element._fetched).toBe(true)
  })

  it('reports failed server responses instead of parsing them', async () => {
    const { element } = await createElement<EmbettyTest>('embetty-test')
    await element.becomesVisible()
    spyOn(window, 'fetch').mockImplementation(
      Object.assign(
        () => Promise.resolve(new Response('Not Found', { status: 404 })),
        { preconnect: fetch.preconnect },
      ),
    )

    await expect(element.becomesVisible()).rejects.toEqual(
      new EmbedLoadError('/', 404),
    )
    expect(element._data).toEqual({})
  })
})
