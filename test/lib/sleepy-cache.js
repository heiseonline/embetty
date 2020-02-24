const SimpleCache = require('./simple-cache')

module.exports = class SleepyCache extends SimpleCache {
  _sleep(ms) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), ms)
    })
  }

  async set(key, value) {
    await this._sleep(20)
    return super.set(key, value)
  }

  async get(key) {
    await this._sleep(30)
    return super.get(key)
  }
}
