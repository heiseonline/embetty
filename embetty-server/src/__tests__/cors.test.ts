import { afterEach, describe, expect, it } from 'bun:test'
import { serveApp } from './lib/serve'

describe('CORS', () => {
  const get = serveApp()
  const fromOrigin = (origin: string) =>
    get('/', { headers: { Origin: origin } })

  afterEach(() => {
    delete process.env.VALID_ORIGINS
  })

  it('should send a "http://example.com" Origin header', async () => {
    const origin = 'http://example.com'
    process.env.VALID_ORIGINS = origin
    const response = await fromOrigin(origin)
    expect(response.headers.get('access-control-allow-origin')).toBe(origin)
    expect(response.status).toBe(404)
  })

  it('should send a 403 status if no valid origin has been sent', async () => {
    process.env.VALID_ORIGINS = 'http://example.com'
    const response = await fromOrigin('http://otherorigin.example.com')
    expect(response.status).toBe(403)
  })

  it('should send dynamic origin headers', async () => {
    process.env.VALID_ORIGINS = 'http://a.example.com,http://b.example.com'

    for (const origin of ['http://a.example.com', 'http://b.example.com']) {
      const response = await fromOrigin(origin)
      expect(response.headers.get('access-control-allow-origin')).toBe(origin)
      expect(response.status).toBe(404)
    }

    const response = await fromOrigin('http://c.example.com')
    expect(response.status).toBe(403)
  })

  it('should support "*" origin', async () => {
    process.env.VALID_ORIGINS = '*'
    const response = await fromOrigin('http://example.com')
    expect(response.status).toBe(404)
  })

  it('should allow requests without an Origin header', async () => {
    process.env.VALID_ORIGINS = 'http://example.com'
    const response = await get('/version')
    expect(response.status).toBe(200)
    expect(response.headers.has('access-control-allow-origin')).toBe(false)
    expect(response.headers.get('vary')).toContain('Origin')
  })

  it('should answer preflights from valid origins', async () => {
    process.env.VALID_ORIGINS = 'http://example.com'
    const response = await get('/version', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://example.com',
        'Access-Control-Request-Method': 'GET',
      },
    })
    expect(response.status).toBe(204)
    expect(response.headers.get('access-control-allow-origin')).toBe(
      'http://example.com',
    )
    expect(response.headers.get('access-control-allow-methods')).toBe(
      'GET, HEAD',
    )
  })
})
