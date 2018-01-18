const {URL} = require('url')
const crypto = require('crypto')

const env = key => process.env[key]

// /!\ TODO FIXME sort recursively
const stringify = object => JSON.stringify(object, Object.keys(object).sort())

const hash = object => {
  const sha256 = crypto.createHash('sha256')
  sha256.update(stringify(object))
  return sha256.digest('base64').toString()
}

const hashRequest = options => {
  const _options = {...options}
  let target = new URL(_options.uri)
  target.port = 80
  _options.uri = target.toString()
  return hash(_options)
}

module.exports = {env, hash, hashRequest, stringify}
