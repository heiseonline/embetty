import { createServer, Server } from 'http'
import { AddressInfo } from 'net'
import request from 'supertest'
import { app } from '../app'

describe('Mastodon', () => {
  afterEach(() => {
    delete process.env.MASTODON_INSTANCES
  })

  it('should respond with 400 for malformed status URLs', async () => {
    await request(app)
      .get('/mastodon/https://user@mastodon.social/@user/1')
      .expect(400)
  })

  it('should respond with 403 for instances not in MASTODON_INSTANCES', async () => {
    process.env.MASTODON_INSTANCES = 'mastodon.social, social.heise.de'

    await request(app).get('/mastodon/https://evil.test/@user/1').expect(403)
  })

  describe('internal targets', () => {
    let server: Server
    let port: number
    let connections: number

    beforeAll(async () => {
      server = createServer((_req, res) => res.end('INTERNAL-ONLY'))
      server.on('connection', () => connections++)
      await new Promise<void>((resolve) =>
        server.listen(0, '127.0.0.1', resolve),
      )
      port = (server.address() as AddressInfo).port
    })

    beforeEach(() => {
      connections = 0
    })

    afterAll(
      () =>
        new Promise<void>((resolve) => {
          server.closeAllConnections()
          server.close(() => resolve())
        }),
    )

    it.each([
      ['an IP literal', () => `127.0.0.1:${port}`],
      ['a hostname', () => `localhost:${port}`],
    ])('should not connect to %s', async (_, host) => {
      const response = await request(app).get(
        `/mastodon/https://${host()}/@user/1/profile-image`,
      )

      expect(response.status).toBe(403)
      expect(connections).toBe(0)
    })
  })
})
