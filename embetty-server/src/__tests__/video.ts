/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable jest/no-disabled-tests */
import assert from 'assert'
import request from 'supertest'
import { app } from '../app'

describe('Video', () => {
  beforeAll(() => {
    process.env.URL_BASE = 'https://example.com/embetty-server'
  })
  afterAll(() => {
    delete process.env.URL_BASE
  })

  describe('Youtube', () => {
    it.skip('should respond with 404', async () => {
      await request(app).get('/video/youtube/123/profile-image').expect(404)
    })

    it('should support AMP', async () => {
      const response = await request(app)
        .get('/video/youtube/m6UOo2YGbIE.amp')
        .expect('Content-Type', /html/)
        .expect(200)
      const expected =
        '<embetty-video type="youtube" video-id="m6UOo2YGbIE"></embetty-video>'
      assert.ok(response.text.includes(expected))
    })

    it('should provide the poster image', async () => {
      const response = await request(app)
        .get('/video/youtube/m6UOo2YGbIE-poster-image')
        .expect('Content-Type', /jpeg/)
        .expect(200)

      assert.ok(Buffer.isBuffer(response.body))
      const imageLength = Buffer.byteLength(response.body)
      assert.ok(imageLength > 100)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      assert.strictEqual(response.headers['content-length'], `${imageLength}`)
    })
  })

  describe('Vimeo', () => {
    it('should respond with 400', async () => {
      await request(app).get('/video/vimeo/abc').expect(400)
    })

    it.skip('should respond with 404', async () => {
      await request(app).get('/video/vimeo/9').expect(404)
    })

    it('should support AMP', async () => {
      const response = await request(app)
        .get('/video/vimeo/223099532.amp')
        .expect('Content-Type', /html/)
        .expect(200)
      const expected =
        '<embetty-video type="vimeo" video-id="223099532"></embetty-video>'
      assert.ok(response.text.includes(expected))
    })

    it('should provide the poster image', async () => {
      const response = await request(app)
        .get('/video/vimeo/223099532-poster-image')
        .expect('Content-Type', /jpeg/)
        .expect(200)

      assert.ok(Buffer.isBuffer(response.body))
      const imageLength = Buffer.byteLength(response.body)
      assert.ok(imageLength > 100)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      assert.strictEqual(response.headers['content-length'], `${imageLength}`)
    })
  })

  describe('Facebook', () => {
    it('should respond with 400', async () => {
      await request(app).get('/video/facebook/abc').expect(400)
    })

    it.skip('should respond with 404', async () => {
      await request(app).get('/video/facebook/0').expect(404)
    })

    it('should support AMP', async () => {
      const response = await request(app)
        .get('/video/facebook/10156049485672318.amp')
        .expect('Content-Type', /html/)
        .expect(200)
      const expected =
        '<embetty-video type="facebook" video-id="10156049485672318"></embetty-video>'
      assert.ok(response.text.includes(expected))
    })
  })
})
