import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'bun:test'
import { createServer, Server } from 'http'
import { AddressInfo } from 'net'
import { LRU } from './cache/lru'
import { Embetty, UnsupportedContentTypeError } from './embetty'
import { createGuardedFetch } from './guarded-http-client'
import { InvalidUpstreamResponseError } from './request-cache'

describe(`${Embetty.name}#getImage`, () => {
  let server: Server
  let origin: string
  let embetty: Embetty

  beforeAll(async () => {
    server = createServer((req, res) => {
      res.setHeader('Content-Type', decodeURIComponent(req.url!.slice(1)))
      res.end('body')
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`

    embetty = new Embetty(
      new LRU('lru://', { ttl: 60 }),
      createGuardedFetch({
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

describe(`${Embetty.name}#get`, () => {
  let server: Server
  let origin: string
  let requests: {
    path: string
    query: Record<string, string>
    authorization: string | undefined
  }[]

  beforeAll(async () => {
    server = createServer((req, res) => {
      const url = new URL(req.url!, 'http://localhost')
      requests.push({
        path: url.pathname,
        query: Object.fromEntries(url.searchParams),
        authorization: req.headers.authorization,
      })
      if (req.url!.startsWith('/page')) {
        res.setHeader('Content-Type', 'text/html')
        res.end(`<head><title>t</title></head>${'x'.repeat(2 * 1024 * 1024)}`)
        return
      }
      if (req.url!.startsWith('/invalid')) {
        res.setHeader('Content-Type', 'application/json')
        res.end('{not json')
        return
      }
      if (req.url!.startsWith('/missing')) {
        res.writeHead(404).end('not found')
        return
      }
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('X-Rate-Limit-Remaining', '42')
      res.end(JSON.stringify({ hello: 'world' }))
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  beforeEach(() => {
    requests = []
  })

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections()
        server.close(() => resolve())
      }),
  )

  const createEmbetty = () =>
    new Embetty(
      new LRU('lru://', { ttl: 60 }),
      createGuardedFetch({
        isAllowedAddress: (address) => address === '127.0.0.1',
      }),
    )

  it('returns parsed JSON with status and lower-cased headers', async () => {
    const entry = await createEmbetty().get({ url: `${origin}/json` })

    expect(entry).toEqual({
      key: expect.any(String),
      data: { hello: 'world' },
      status: 200,
      headers: expect.objectContaining({
        'content-type': 'application/json; charset=utf-8',
        'x-rate-limit-remaining': '42',
      }),
    })
  })

  it('sends query parameters and headers', async () => {
    await createEmbetty().get({
      url: `${origin}/json`,
      params: { 'a.b': 'c,d', e: 'f g' },
      headers: { Authorization: 'Bearer token' },
    })

    expect(requests).toEqual([
      {
        path: '/json',
        query: { 'a.b': 'c,d', e: 'f g' },
        authorization: 'Bearer token',
      },
    ])
  })

  it('serves repeated requests from the cache', async () => {
    const embetty = createEmbetty()

    const first = await embetty.get({ url: `${origin}/json` })
    const second = await embetty.get({ url: `${origin}/json` })

    expect(second).toEqual(first)
    expect(requests).toHaveLength(1)
  })

  it('rejects unsuccessful responses', async () => {
    await expect(
      createEmbetty().get({ url: `${origin}/missing` }),
    ).rejects.toThrow('status code 404')
  })

  it('caches the same URL separately per response type', async () => {
    const embetty = createEmbetty()

    await embetty.get({ url: `${origin}/json` })
    const text = await embetty.get<string>({
      url: `${origin}/json`,
      responseType: 'text',
    })

    expect(text?.data).toBe(JSON.stringify({ hello: 'world' }))
  })

  it('caches the same URL separately per query', async () => {
    const embetty = createEmbetty()

    await embetty.get({ url: `${origin}/json`, params: { a: '1' } })
    await embetty.get({ url: `${origin}/json`, params: { a: '2' } })

    expect(requests.map(({ query }) => query)).toEqual([{ a: '1' }, { a: '2' }])
  })

  it('reads the beginning of large web pages', async () => {
    const page = await createEmbetty().get<string>({
      url: `${origin}/page`,
      responseType: 'text',
    })

    expect(page?.data?.startsWith('<head><title>t</title></head>')).toBe(true)
  })

  it('rejects malformed JSON as an invalid upstream response', async () => {
    await expect(
      createEmbetty().get({ url: `${origin}/invalid` }),
    ).rejects.toBeInstanceOf(InvalidUpstreamResponseError)
  })
})

describe(`${Embetty.name}.createCache`, () => {
  afterEach(() => {
    delete process.env.EMBETTY_CACHE_TTL
  })

  it.each(['1.5', '-1', 'abc'])('rejects EMBETTY_CACHE_TTL=%s', (ttl) => {
    process.env.EMBETTY_CACHE_TTL = ttl
    expect(() => Embetty.createCache()).toThrow('EMBETTY_CACHE_TTL')
  })
})

describe(`${Embetty.name}.trustedHosts`, () => {
  afterEach(() => {
    delete process.env.EMBETTY_TRUSTED_HOSTS
  })

  it('reads EMBETTY_TRUSTED_HOSTS', () => {
    process.env.EMBETTY_TRUSTED_HOSTS = ' www.heise.de, WWW.Techstage.de ,,'
    expect(Embetty.trustedHosts()).toEqual(['www.heise.de', 'www.techstage.de'])
  })

  it('trusts no host by default', () => {
    expect(Embetty.trustedHosts()).toEqual([])
  })
})
