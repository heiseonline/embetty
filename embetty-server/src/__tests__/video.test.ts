import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { expectHtml, expectImage, serveApp } from './lib/serve'

describe('Video', () => {
  const get = serveApp()
  const status = async (path: string) => (await get(path)).status

  beforeAll(() => {
    process.env.URL_BASE = 'https://example.com/embetty-server'
  })
  afterAll(() => {
    delete process.env.URL_BASE
  })

  describe('Youtube', () => {
    it('should respond with 404', async () => {
      expect(await status('/video/youtube/123/profile-image')).toBe(404)
    })

    it('should support AMP', async () => {
      const page = await expectHtml(await get('/video/youtube/m6UOo2YGbIE.amp'))
      expect(page).toContain(
        '<embetty-video type="youtube" video-id="m6UOo2YGbIE"></embetty-video>',
      )
    })

    it('should provide the poster image', async () => {
      await expectImage(
        await get('/video/youtube/m6UOo2YGbIE-poster-image'),
        /jpeg/,
      )
    })
  })

  describe('Vimeo', () => {
    it('should respond with 400', async () => {
      expect(await status('/video/vimeo/abc')).toBe(400)
    })

    it('should respond with 404', async () => {
      expect(await status('/video/vimeo/9')).toBe(404)
    })

    it('should support AMP', async () => {
      const page = await expectHtml(await get('/video/vimeo/223099532.amp'))
      expect(page).toContain(
        '<embetty-video type="vimeo" video-id="223099532"></embetty-video>',
      )
    })

    it('should provide the poster image', async () => {
      await expectImage(
        await get('/video/vimeo/223099532-poster-image'),
        /jpeg/,
      )
    })
  })

  describe('Facebook', () => {
    it('should respond with 400', async () => {
      expect(await status('/video/facebook/abc')).toBe(400)
    })

    it('should support AMP', async () => {
      const page = await expectHtml(
        await get('/video/facebook/10156049485672318.amp'),
      )
      expect(page).toContain(
        '<embetty-video type="facebook" video-id="10156049485672318"></embetty-video>',
      )
    })
  })
})
