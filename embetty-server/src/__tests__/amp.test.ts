import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { expectHtml, serveApp } from './lib/serve'

describe('AMP pages', () => {
  const get = serveApp()

  beforeAll(() => {
    process.env.URL_BASE = 'https://example.com/embetty-server'
  })
  afterAll(() => {
    delete process.env.URL_BASE
  })

  const ampPage = async (path: string) => expectHtml(await get(path))

  it('points the component at this server', async () => {
    const page = await ampPage('/video/youtube/m6UOo2YGbIE.amp')

    expect(page).toContain(
      '<meta data-embetty-server="https://example.com/embetty-server" />',
    )
    expect(page).toContain(
      '<script async src="https://example.com/embetty-server/embetty.js"></script>',
    )
  })

  it('passes supported attributes on to the video', async () => {
    const page = await ampPage(
      '/video/youtube/m6UOo2YGbIE.amp?start-at=37&poster-image=https%3A%2F%2Fexample.com%2Fp.jpg',
    )

    expect(page).toContain(
      '<embetty-video type="youtube" video-id="m6UOo2YGbIE" start-at="37" poster-image="https://example.com/p.jpg"></embetty-video>',
    )
  })

  it('escapes attribute values', async () => {
    const page = await ampPage(
      `/video/youtube/m6UOo2YGbIE.amp?start-at=${encodeURIComponent('"><script>')}`,
    )

    expect(page).toContain('start-at="&quot;&gt;&lt;script&gt;"')
    expect(page).not.toContain('"><script>')
  })

  it('drops other attributes, which could carry event handlers', async () => {
    const page = await ampPage(
      '/video/youtube/m6UOo2YGbIE.amp?onmouseover=alert(1)&server-url=https://evil.test',
    )

    expect(page).toContain(
      '<embetty-video type="youtube" video-id="m6UOo2YGbIE"></embetty-video>',
    )
  })
})
