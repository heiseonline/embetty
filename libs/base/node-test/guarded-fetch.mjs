// The server runs on Node, but `bun test` runs on Bun. The guard relies on
// node:http/net internals (lookup contract, IP literals skipping the lookup),
// so its core cases also run against the built package on Node.
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { after, before, test } from 'node:test'
import base from '../dist/index.js'

const { createGuardedFetch, ForbiddenTargetError } = base

let server
let origin
let port
let connections = 0
let handler = (_req, res) => res.end('ok')

before(async () => {
  server = createServer((req, res) => handler(req, res))
  server.on('connection', () => connections++)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  port = server.address().port
  origin = `http://127.0.0.1:${port}`
})

after(() => {
  server.closeAllConnections()
  server.close()
})

const onlyTestServer = (address) => address === '127.0.0.1'
const resolveTo = (address) => () => Promise.resolve([address])

test('requests allowed targets', async () => {
  handler = (_req, res) => res.end('ok')
  const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

  const response = await fetch(origin)

  assert.equal(await response.text(), 'ok')
})

test('rejects forbidden IP literals without connecting', async () => {
  const before = connections

  await assert.rejects(createGuardedFetch()(origin), ForbiddenTargetError)
  assert.equal(connections, before)
})

test('rejects hostnames resolving to forbidden addresses without connecting', async () => {
  const before = connections
  const fetch = createGuardedFetch({ resolve: resolveTo('127.0.0.1') })

  await assert.rejects(
    fetch(`http://internal.test:${port}/`),
    ForbiddenTargetError,
  )
  assert.equal(connections, before)
})

test('rejects redirects to forbidden hostnames', async () => {
  handler = (_req, res) =>
    res.writeHead(302, { Location: `http://internal.test:${port}/` }).end()
  const fetch = createGuardedFetch({
    isAllowedAddress: onlyTestServer,
    resolve: resolveTo('10.0.0.1'),
  })

  await assert.rejects(fetch(origin), ForbiddenTargetError)
})

test('aborts responses that trickle in beyond the timeout', async () => {
  handler = (_req, res) => {
    res.writeHead(200)
    const interval = setInterval(() => res.write('.'), 50)
    res.on('close', () => clearInterval(interval))
  }
  const fetch = createGuardedFetch({ isAllowedAddress: onlyTestServer })

  await assert.rejects(fetch(origin, { timeout: 300 }), {
    name: 'TimeoutError',
  })
})
