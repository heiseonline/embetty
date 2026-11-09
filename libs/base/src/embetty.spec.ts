import { createServer, Server } from 'http'
import { AddressInfo } from 'net'
import { LRU } from './cache/lru'
import { Embetty, UnsupportedContentTypeError } from './embetty'
import { createGuardedHttpClient } from './guarded-http-client'

describe(`${Embetty.name}#getImage`, () => {
  let server: Server
  let origin: string
  let embetty: Embetty<unknown>

  beforeAll(async () => {
    server = createServer((req, res) => {
      res.setHeader('Content-Type', decodeURIComponent(req.url!.slice(1)))
      res.end('body')
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

    embetty = new Embetty(
      new LRU('lru://'),
      createGuardedHttpClient({
        isAllowedAddress: (address) => address === '127.0.0.1',
      }),
    )
  })

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections()
        server.close(() => resolve())
      }),
  )

  const imageUrl = (contentType: string) =>
    `${origin}/${encodeURIComponent(contentType)}`

  it.each(['image/jpeg', 'image/png; charset=binary', 'IMAGE/WEBP'])(
    'returns %s images',
    async (contentType) => {
      const image = await embetty.getImage({ url: imageUrl(contentType) })

      expect(image).toEqual({
        data: Buffer.from('body'),
        type: contentType.split(';')[0]!.toLowerCase(),
      })
    },
  )

  it.each(['text/html', 'image/svg+xml', 'application/javascript'])(
    'rejects %s',
    async (contentType) => {
      await expect(
        embetty.getImage({ url: imageUrl(contentType) }),
      ).rejects.toEqual(new UnsupportedContentTypeError(contentType))
    },
  )
})
