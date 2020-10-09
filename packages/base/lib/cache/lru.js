const LRUCache = require('lru-cache')

module.exports = class LRU {
  constructor(options) {
    if (typeof options === 'string') {
      options = LRU.parse(options)
    }
    this._options = options
    this._cache = LRUCache(options)
  }

  get(key) {
    return this._cache.get(key)
  }

  set(key, value) {
    return this._cache.set(key, value)
  }

  static parse(string) {
    const options = {}
    const lruPattern = /^lru:\/\//
    if (!lruPattern.test(string)) return options
    string
      .replace(lruPattern, '')
      .split(',')
      .filter(e => e.length > 0)
      .forEach(option => {
        const [key, value] = option.split(':')
        options[key] = value
      })
    return options
  }
}
