import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import { AddressInfo } from 'net'
import {
  AddressPolicy,
  assertAllowedTarget,
  createGuardedHttpClient,
  ForbiddenTargetError,
  guardedLookup,
  isPublicAddress,
  Resolver,
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

const hasCause = (error: unknown): error is { cause: unknown } =>
  typeof error === 'object' &&
  error !== null &&
  'cause' in error &&
  error.cause !== undefined

// axios and follow-redirects wrap errors; the root cause is what matters.
const rejectionCause = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise
  } catch (error) {
    let cause: unknown = error
    while (hasCause(cause)) {
      cause = cause.cause
    }
    return cause
  }
  throw new Error('Expected promise to reject')
}

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

    await expect(lookup('mixed.test')).rejects.toThrow(ForbiddenTargetError)
  })

  it('returns all resolved addresses if every one is allowed', async () => {
    const lookup = guardedLookup(
      isPublicAddress,
      resolveTo('1.1.1.1', '2606:4700::1111'),
    )

    await expect(lookup('public.test')).resolves.toEqual([
      [{ address: '1.1.1.1' }, { address: '2606:4700::1111' }],
    ])
  })
})

describe('createGuardedHttpClient', () => {
  let server: TestServer
  let handler: Handler

  beforeEach(async () => {
    handler = (_req, res) => res.end('ok')
    server = await startServer((req, res) => handler(req, res))
  })

  afterEach(() => server.close())

  it('requests allowed targets', async () => {
    const client = createGuardedHttpClient({ isAllowedAddress: onlyTestServer })

    const response = await client.get<string>(server.origin)

    expect(response.data).toBe('ok')
  })

  it('rejects forbidden IP literals without connecting', async () => {
    const client = createGuardedHttpClient()

    expect(await rejectionCause(client.get(server.origin))).toBeInstanceOf(
      ForbiddenTargetError,
    )
    expect(server.connections()).toBe(0)
  })

  it('rejects hostnames resolving to forbidden addresses without connecting', async () => {
    const client = createGuardedHttpClient({
      resolve: resolveTo('127.0.0.1'),
    })

    expect(
      await rejectionCause(client.get(`http://internal.test:${server.port}/`)),
    ).toBeInstanceOf(ForbiddenTargetError)
    expect(server.connections()).toBe(0)
  })

  it.each([
    ['an IP literal', () => 'http://127.0.0.2/secret'],
    ['a hostname', () => `http://internal.test:${server.port}/secret`],
  ])('rejects redirects to %s', async (_, location) => {
    handler = (_req, res) => {
      res.writeHead(302, { Location: location() }).end()
    }
    const client = createGuardedHttpClient({
      isAllowedAddress: onlyTestServer,
      resolve: resolveTo('10.0.0.1'),
    })

    expect(await rejectionCause(client.get(server.origin))).toBeInstanceOf(
      ForbiddenTargetError,
    )
  })

  it('ignores per-request options that would bypass the guard', async () => {
    handler = (_req, res) => {
      res.writeHead(302, { Location: 'http://127.0.0.2/secret' }).end()
    }
    const client = createGuardedHttpClient({ isAllowedAddress: onlyTestServer })

    const cause = await rejectionCause(
      client.get(server.origin, {
        beforeRedirect: () => undefined,
        lookup: (_hostname, _options, callback) =>
          callback(null, '127.0.0.2', 4),
        maxRedirects: 5,
      }),
    )

    expect(cause).toBeInstanceOf(ForbiddenTargetError)
  })

  it('ignores proxy environment variables', async () => {
    const proxy = await startServer((_req, res) => res.end('proxied'))
    process.env.HTTP_PROXY = proxy.origin
    process.env.http_proxy = proxy.origin

    try {
      const client = createGuardedHttpClient({
        isAllowedAddress: onlyTestServer,
      })

      const response = await client.get<string>(server.origin)

      expect(response.data).toBe('ok')
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
    const client = createGuardedHttpClient({ isAllowedAddress: onlyTestServer })

    await expect(
      client.get(server.origin, { timeout: 300 }),
    ).rejects.toMatchObject({ code: 'ERR_CANCELED' })
  })

  it('still honors a caller-provided signal', async () => {
    handler = () => undefined
    const client = createGuardedHttpClient({ isAllowedAddress: onlyTestServer })
    const controller = new AbortController()

    const request = client.get(server.origin, { signal: controller.signal })
    controller.abort()

    await expect(request).rejects.toMatchObject({ code: 'ERR_CANCELED' })
  })

  it('aborts trickling responses despite a caller-provided signal', async () => {
    handler = (_req, res) => {
      res.writeHead(200)
      const interval = setInterval(() => res.write('.'), 50)
      res.on('close', () => clearInterval(interval))
    }
    const client = createGuardedHttpClient({ isAllowedAddress: onlyTestServer })

    await expect(
      client.get(server.origin, {
        signal: new AbortController().signal,
        timeout: 300,
      }),
    ).rejects.toMatchObject({ code: 'ERR_CANCELED' })
  })

  it('rejects responses exceeding the size limit', async () => {
    handler = (_req, res) => res.end(Buffer.alloc(11 * 1024 * 1024))
    const client = createGuardedHttpClient({ isAllowedAddress: onlyTestServer })

    await expect(client.get(server.origin)).rejects.toThrow(/maxContentLength/)
  })
})
