const { hashRequest } = require('./util')
const debug = require('debug')('embetty-base:request-cache')
const request = require('request-promise-native')

module.exports = cache => {
  const set = (key, value) => {
    return cache.set(key, value)
  }

  const setJSON = (key, value) => {
    return cache.set(key, JSON.stringify(value))
  }

  // Converting a buffer to JSON is quite slow.For this reason, the buffer is
  // stored in a separate cache so that it does not need to be converted.
  const setBinary = async (key, value) => {
    if (Buffer.isBuffer(value)) return set(key, value)
    value = { ...value }
    const { body } = value
    delete value.body
    return Promise.all([set(`${key}_body`, body), setJSON(key, value)])
  }

  const get = async key => {
    const value = await cache.get(key)
    if (!value) return undefined
    if (Buffer.isBuffer(value)) return value
    return JSON.parse(value)
  }

  const getBinary = async key => {
    const [body, response] = await Promise.all([
      cache.get(`${key}_body`, { isBinary: true }),
      get(key),
    ])
    if (!response || !body) return undefined
    response.body = body
    return response
  }

  return async options => {
    const key = hashRequest(options)
    const debugId = `${options.method || 'GET'} ${options.uri} ["${key}"]`
    const isBinary = options.encoding === null

    let value = isBinary ? await getBinary(key) : await get(key)
    if (value) {
      debug(`Serving from cache: ${debugId} ...`)
      return value
    }

    debug(`Requesting ${debugId} ...`)
    value = await request.get(options)

    debug(`Caching ${debugId} ...`)
    ;(await isBinary) ? setBinary(key, value) : setJSON(key, value)

    return value
  }
}
