module.exports = class SimpleCache {
  constructor() {
    this._cache = {}
  }

  set(key, value) {
    this._cache[key] = value
  }

  get(key) {
    return this._cache[key]
  }
}
