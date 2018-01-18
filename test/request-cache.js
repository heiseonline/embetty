const assert = require('assert')
const cachedRequest = require('../lib/request-cache')
const http = require('http')
const nock = require('nock')
const SimpleCache = require('./lib/simple-cache')
const SleepyCache = require('./lib/sleepy-cache')

let server = http
  .createServer((req, res) => {
    if (req.url.includes('buffer')) {
      return res.end(Buffer.from('Buffer: ok'))
    }
    if (req.url.includes('empty')) {
      return res.end('{"foo": {"bar": null}}')
    }
    res.end('ok')
  })
  .listen()

after(() => server.close())
afterEach(() => {
  nock.cleanAll()
  nock.enableNetConnect()
})

describe('Request cache', () => {
  let {address, family, port} = server.address()
  address = family === 'IPv6' ? `[${address}]` : address
  const options = {uri: `http://${address}:${port}`}

  it('calls the backend once', async () => {
    const request = cachedRequest(new SimpleCache())
    nock.enableNetConnect()
    assert.equal(await request(options), 'ok')
    nock.disableNetConnect()
    assert.equal(await request(options), 'ok')
  })

  it('supports cache interfaces that use Promises', async () => {
    const request = cachedRequest(new SleepyCache())
    nock.enableNetConnect()
    assert.equal(await request(options), 'ok')
    nock.disableNetConnect()
    assert.equal(await request(options), 'ok')
  })

  it('should support JSON reponses with "null" values', async () => {
    const request = cachedRequest(new SimpleCache())
    const options = {uri: `http://${address}:${port}/empty`, json: true}
    await request(options)
    const data = await request(options)
    assert.equal(typeof data, 'object')
  })

  it('should support Buffers', async () => {
    const cache = new SimpleCache()
    const request = cachedRequest(cache)
    const options = {uri: `http://${address}:${port}/buffer`, encoding: null}

    const data = await request(options)
    assert.ok(Buffer.isBuffer(data))
    assert.ok(Buffer.isBuffer(cache._cache['QT+pKmR6ILOMRHaBdDppCPUBPwKKMKONZM/WFbrznNk=']))

    // cached
    const data2 = await request(options)
    assert.ok(Buffer.isBuffer(data2))

    assert.deepEqual(data, data2)
  })

  it('should support Buffers w/ "resolveWithFullResponse"', async () => {
    const cache = new SimpleCache()
    const request = cachedRequest(cache)
    const options = {
      uri: `http://${address}:${port}/buffer`,
      encoding: null,
      resolveWithFullResponse: true,
    }

    const data = await request(options)
    assert.ok(typeof data === 'object')
    assert.ok(typeof data.headers === 'object')
    assert.ok(Buffer.isBuffer(data.body))

    const cacheKey = 'KYxjPxtygFg1rtGzaACv8FpCf1Tkpn5OKZ+uUVEhEL8='
    const body = cache._cache[`${cacheKey}_body`]
    const responseWithoutBody = JSON.parse(cache._cache[`${cacheKey}`])
    assert.ok(Buffer.isBuffer(body))

    assert.equal(data.body, body)
    assert.deepEqual(data.headers, responseWithoutBody.headers)

    // cached
    const data2 = await request(options)
    assert.equal(data.body, data2.body)
    assert.deepEqual(data.headers, data2.headers)
  })
})
