/* eslint-disable jest/expect-expect */
import assert from 'assert'
import request from 'supertest'
import { app } from '../app'

describe('CORS', () => {
  it('should send a "http://example.com" Origin header', async () => {
    const origin = 'http://example.com'
    process.env.VALID_ORIGINS = origin
    const response = await request(app).get('/').set('Origin', origin)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    assert.strictEqual(response.headers['access-control-allow-origin'], origin)
    assert.strictEqual(response.status, 404)
  })

  it('should send a 403 status if no valid origin has been sent', async () => {
    process.env.VALID_ORIGINS = 'http://example.com'
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://otherorigin.example.com')
    assert.strictEqual(response.status, 403)
  })

  it('should send dynamic origin headers', async () => {
    const origin = 'http://a.example.com,http://b.example.com'
    process.env.VALID_ORIGINS = origin

    const response = await request(app)
      .get('/')
      .set('Origin', 'http://a.example.com')
    assert.strictEqual(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.headers['access-control-allow-origin'],
      'http://a.example.com',
    )
    assert.strictEqual(response.status, 404)

    const response2 = await request(app)
      .get('/')
      .set('Origin', 'http://b.example.com')
    assert.strictEqual(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response2.headers['access-control-allow-origin'],
      'http://b.example.com',
    )
    assert.strictEqual(response2.status, 404)

    const response3 = await request(app)
      .get('/')
      .set('Origin', 'http://c.example.com')
    assert.strictEqual(response3.status, 403)
  })

  it('should support "*" origin', async () => {
    process.env.VALID_ORIGINS = '*'
    const response = await request(app)
      .get('/')
      .set('Origin', 'http://example.com')
    assert.strictEqual(response.status, 404)
  })
})
