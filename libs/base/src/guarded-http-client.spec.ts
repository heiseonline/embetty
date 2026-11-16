import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { AddressInfo } from 'net'
import {
  AddressPolicy,
  assertAllowedTarget,
  createGuardedFetch,
  ForbiddenTargetError,
  GuardedRequestInit,
  guardedLookup,
  isPublicAddress,
  Resolver,
  ResponseTooLargeError,
  TooManyRedirectsError,
} from './guarded-http-client'

type Handler = (req: IncomingMessage, res: ServerResponse) => void

interface TestServer {
  origin: string
  port: number
  connections: () => number
  close: () => Promise<void>
}

async function startServer(handler: Handler): Promise<TestServer> {
  let connections = 0
  const server: Server = createServer(handler)
  server.on('connection', () => connections++)

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo

  return {
    origin: `http://127.0.0.1:${port}`,
    port,
    connections: () => connections,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections()
        server.close(() => resolve())
      }),
  }
}

// Loopback is the only address we can listen on in tests, so it stands in for
// "public" here while 127.0.0.2 plays the internal target.
const onlyTestServer: AddressPolicy = (address) => address === '127.0.0.1'

const resolveTo =
  (...addresses: string[]): Resolver =>
  () =>
    Promise.resolve(addresses)

const lookupAll = (
  lookup: ReturnType<typeof guardedLookup>,
  hostname: string,
): Promise<unknown> =>
  new Promise((resolve, reject) => {
    lookup(hostname, { all: true }, (error, addresses) =>
      error ? reject(error) : resolve(addresses),
    )
  })

describe('isPublicAddress', () => {
  it.each([
    '0.0.0.0',
    '10.0.0.1',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.168.1.1',
    '224.0.0.1',
    '255.255.255.255',
    '::',
    '::1',
    '::ffff:127.0.0.1',
    '::ffff:a9fe:a9fe',
    '64:ff9b::a9fe:a9fe',
    '2002:7f00:1::',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    'ff02::1',
    '::7f00:1',
    'fec0::1',
    '64:ff9b:1::a9fe:a9fe',
    '5f00::1',
    '3fff::1',
    'not-an-ip',
  ])('rejects %s', (address) => {
    expect(isPublicAddress(address)).toBe(false)
  })

  it.each(['1.1.1.1', '193.99.144.80', '2a02:2e0:3fe:1001:302::'])(
    'accepts %s',
    (address) => {
      expect(isPublicAddress(address)).toBe(true)
    },
  )
})

describe('assertAllowedTarget', () => {
  it.each(['file:', 'data:', 'ftp:', 'gopher:'])('rejects %s', (protocol) => {
    expect(() =>
      assertAllowedTarget({ protocol, hostname: 'example.com' }, () => true),
    ).toThrow(ForbiddenTargetError)
  })

  it('rejects bracketed IPv6 literals', () => {
    expect(() =>
      assertAllowedTarget(
        { protocol: 'http:', hostname: '[::1]' },
        isPublicAddress,
      ),
    ).toThrow(ForbiddenTargetError)
  })

  it('leaves hostnames to the lookup', () => {
    expect(() =>
      assertAllowedTarget(
        { protocol: 'https:', hostname: 'localhost' },
        isPublicAddress,
      ),
    ).not.toThrow()
  })
})

describe('guardedLookup', () => {
  it('rejects a hostname if any resolved address is forbidden', async () => {
    const lookup = guardedLookup(isPublicAddress, resolveTo('1.1.1.1', '::1'))

    await expect(lookupAll(lookup, 'mixed.test')).rejects.toThrow(
      ForbiddenTargetError,
    )
  })

  it.each([
    ['nothing', resolveTo()],
    ['only another address family', resolveTo('2606:4700::1111')],
  ])('rejects a hostname resolving to %s', async (_, resolve) => {
    const lookup = guardedLookup(isPublicAddress, resolve)

    await expect(
      new Promise((ok, fail) => {
        lookup('empty.test', { all: true, family: 4 }, (error, addresses) =>
          error ? fail(error) : ok(addresses),
        )
      }),
    ).rejects.toThrow(ForbiddenTargetError)
  })

  it('returns all resolved addresses if every one is allowed', async () => {
    const lookup = guardedLookup(
      isPublicAddress,
      resolveTo('1.1.1.1', '2606:4700::1111'),
    )

    await expect(lookupAll(lookup, 'public.test')).resolves.toEqual([
      { address: '1.1.1.1', family: 4 },
      { address: '2606:4700::1111', family: 6 },
    ])
  })
})

describe('createGuardedFetch', () => {
  let server: TestServer
  let handler: Handler

  beforeEach(async () => {
    handler = (_req, res) => res.end('ok')
    server = await startServer((req, res) => handler(req, res))
  })

  afterEach(() => server.close())

  it('requests allowed targets', async () => {
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    const response = await fetch(server.origin)

    expect(await response.text()).toBe('ok')
  })

  it('rejects forbidden IP literals without connecting', async () => {
    const fetch = createGuardedFetch()

    await expect(fetch(server.origin)).rejects.toThrow(ForbiddenTargetError)
    expect(server.connections()).toBe(0)
  })

  it('rejects hostnames resolving to forbidden addresses without connecting', async () => {
    const fetch = createGuardedFetch({ resolve: resolveTo('127.0.0.1') })

    await expect(fetch(`http://internal.test:${server.port}/`)).rejects.toThrow(
      ForbiddenTargetError,
    )
    expect(server.connections()).toBe(0)
  })

  it.each([
    ['an IP literal', () => 'http://127.0.0.2/secret'],
    ['a hostname', () => `http://internal.test:${server.port}/secret`],
  ])('rejects redirects to %s', async (_, location) => {
    handler = (_req, res) => {
      res.writeHead(302, { Location: location() }).end()
    }
    const fetch = createGuardedFetch({
      isAllowedAddress: onlyTestServer,
      resolve: resolveTo('10.0.0.1'),
    })

    await expect(fetch(server.origin)).rejects.toThrow(ForbiddenTargetError)
  })

  it('follows redirects to allowed targets', async () => {
    handler = (req, res) => {
      if (req.url === '/target') {
        res.end('redirected')
      } else {
        res.writeHead(302, { Location: '/target' }).end()
      }
    }
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    const response = await fetch(server.origin)

    expect(await response.text()).toBe('redirected')
  })

  it('gives up after too many redirects', async () => {
    handler = (_req, res) => res.writeHead(302, { Location: '/' }).end()
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    await expect(fetch(server.origin)).rejects.toThrow(TooManyRedirectsError)
  })

  it('drops credentials when redirecting to another origin', async () => {
    const other = await startServer((req, res) =>
      res.end(JSON.stringify(req.headers)),
    )
    handler = (_req, res) => {
      res.writeHead(302, { Location: other.origin }).end()
    }
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    try {
      const response = await fetch(server.origin, {
        headers: { Authorization: 'Bearer secret', Accept: 'text/plain' },
      })

      expect(await response.json()).toEqual(
        expect.not.objectContaining({ authorization: expect.anything() }),
      )
    } finally {
      await other.close()
    }
  })

  it('ignores per-request options that would bypass the guard', async () => {
    handler = (_req, res) => {
      res.writeHead(302, { Location: 'http://127.0.0.2/secret' }).end()
    }
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })
    // Untyped callers could pass node:http options along.
    const init: GuardedRequestInit = Object.assign(
      {},
      {
        lookup: (
          _hostname: string,
          _options: unknown,
          callback: (error: null, address: string, family: number) => void,
        ) => callback(null, '127.0.0.2', 4),
        agent: false,
        maxRedirects: 5,
        timeout: 1000,
      },
    )

    await expect(fetch(server.origin, init)).rejects.toThrow(
      ForbiddenTargetError,
    )
  })

  it('ignores proxy environment variables', async () => {
    const proxy = await startServer((_req, res) => res.end('proxied'))
    process.env.HTTP_PROXY = proxy.origin
    process.env.http_proxy = proxy.origin

    try {
      const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

      const response = await fetch(server.origin)

      expect(await response.text()).toBe('ok')
      expect(proxy.connections()).toBe(0)
    } finally {
      delete process.env.HTTP_PROXY
      delete process.env.http_proxy
      await proxy.close()
    }
  })

  it('aborts responses that trickle in beyond the timeout', async () => {
    handler = (_req, res) => {
      res.writeHead(200)
      const interval = setInterval(() => res.write('.'), 50)
      res.on('close', () => clearInterval(interval))
    }
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    await expect(fetch(server.origin, { timeout: 300 })).rejects.toMatchObject({
      name: 'TimeoutError',
    })
  })

  it('still honors a caller-provided signal', async () => {
    handler = () => undefined
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })
    const controller = new AbortController()

    const request = fetch(server.origin, { signal: controller.signal })
    controller.abort()

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('aborts trickling responses despite a caller-provided signal', async () => {
    handler = (_req, res) => {
      res.writeHead(200)
      const interval = setInterval(() => res.write('.'), 50)
      res.on('close', () => clearInterval(interval))
    }
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    await expect(
      fetch(server.origin, {
        signal: new AbortController().signal,
        timeout: 300,
      }),
    ).rejects.toMatchObject({ name: 'TimeoutError' })
  })

  it.each([
    ['declared', true],
    ['streamed', false],
  ])('rejects %s responses exceeding the size limit', async (_, declared) => {
    const body = Buffer.alloc(11 * 1024 * 1024)
    handler = (_req, res) => {
      if (!declared) {
        res.setHeader('Transfer-Encoding', 'chunked')
      }
      res.end(body)
    }
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    await expect(fetch(server.origin)).rejects.toThrow(ResponseTooLargeError)
  })

  it('applies a lower size limit per request', async () => {
    handler = (_req, res) => res.end(Buffer.alloc(2048))
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    await expect(fetch(server.origin, { maxBytes: 1024 })).rejects.toThrow(
      ResponseTooLargeError,
    )
    expect((await fetch(server.origin, { maxBytes: 4096 })).ok).toBe(true)
  })

  it('cuts bodies at the limit when asked to', async () => {
    handler = (_req, res) => res.end('a'.repeat(4096))
    const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

    const response = await fetch(server.origin, {
      maxBytes: 1024,
      truncate: true,
    })

    expect(await response.text()).toBe('a'.repeat(1024))
  })

  describe('trusted hosts', () => {
    it('may resolve to addresses the policy forbids', async () => {
      const fetch = createGuardedFetch({
        resolve: resolveTo('127.0.0.1'),
        trustedHosts: ['Own.Test'],
      })

      const response = await fetch(`http://own.test:${server.port}/`)

      expect(await response.text()).toBe('ok')
    })

    it('do not extend to other hosts', async () => {
      const fetch = createGuardedFetch({
        resolve: resolveTo('127.0.0.1'),
        trustedHosts: ['own.test'],
      })

      await expect(
        fetch(`http://sub.own.test:${server.port}/`),
      ).rejects.toThrow(ForbiddenTargetError)
    })

    it('cannot redirect to untrusted internal targets', async () => {
      handler = (req, res) => {
        if (req.headers.host?.startsWith('own.test')) {
          res
            .writeHead(302, {
              Location: `http://internal.test:${server.port}/`,
            })
            .end()
        } else {
          res.end('internal')
        }
      }
      const fetch = createGuardedFetch({
        resolve: resolveTo('127.0.0.1'),
        trustedHosts: ['own.test'],
      })

      await expect(fetch(`http://own.test:${server.port}/`)).rejects.toThrow(
        ForbiddenTargetError,
      )
    })
  })
})
