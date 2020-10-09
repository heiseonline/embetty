const IORedis = require('ioredis')

module.exports = class Redis extends IORedis {
  get(key, { isBinary = false } = {}) {
    if (isBinary) return super.getBuffer(key)
    return super.get(key)
  }
}
