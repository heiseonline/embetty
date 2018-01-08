const app = require('..')
const assert = require('assert')
const request = require('supertest')

describe('embetty-server', () => {
  it('/ is 404', async () => {
    await request(app)
      .get('/')
      .expect(404)
  })

  it('should not send a "x-powered-by" header', async () => {
    const response = await request(app).get('/')
    assert.ok(!('x-powered-by' in response.headers))
  })

  it('"x-frame-options" is "SAMEORIGIN', async () => {
    const response = await request(app).get('/')
    assert.equal(response.headers['x-frame-options'], 'SAMEORIGIN')
  })

  describe('CORS', () => {
    it('should send a "http://example.com" Origin header', async () => {
      const origin = 'http://example.com'
      process.env.VALID_ORIGINS = origin
      const response = await request(app).get('/').set('Origin', origin)
      assert.equal(response.headers['access-control-allow-origin'], origin)
      assert.equal(response.status, 404)
    })

    it('should send a 403 status if no valid origin has been sent', async () => {
      process.env.VALID_ORIGINS = 'http://example.com'
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://otherorigin.example.com')
      assert.equal(response.status, 403)
    })

    it('should send dynamic origin headers', async () => {
      const origin = 'http://a.example.com,http://b.example.com'
      process.env.VALID_ORIGINS = origin

      const response = await request(app)
        .get('/')
        .set('Origin', 'http://a.example.com')
      assert.equal(response.headers['access-control-allow-origin'], 'http://a.example.com')
      assert.equal(response.status, 404)

      const response2 = await request(app)
        .get('/')
        .set('Origin', 'http://b.example.com')
      assert.equal(response2.headers['access-control-allow-origin'], 'http://b.example.com')
      assert.equal(response2.status, 404)

      const response3 = await request(app)
        .get('/')
        .set('Origin', 'http://c.example.com')
      assert.equal(response3.status, 403)
    })
  })
})
