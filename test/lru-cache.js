const assert = require('assert')
const LRU = require('../lib/cache/lru')

describe('LRU Cache', () => {
  it('should should wrap "lru-cache"', () => {
    const cache = new LRU()
    cache.set('foo', 'bar')
    assert.equal(cache.get('foo'), 'bar')
  })

  it('should pass options to "lru-cache"', () => {
    const cache = new LRU({max: 1})
    cache.set('foo', 'bar')
    cache.set('bar', 'baz')
    assert.equal(cache._cache.length, 1)
  })

  describe('Connection string', () => {
    it('should accept a connection string as constructor argument', () => {
      const cache = new LRU('lru://foo:bar')
      assert.deepEqual(cache._options, {foo: 'bar'})
    })

    it('should parse empty options', () => {
      assert.deepEqual(LRU.parse('lru://'), {})
    })

    it('should parse one option', () => {
      assert.deepEqual(LRU.parse('lru://max:10'), {max: 10})
    })

    it('should parse multiple options', () => {
      assert.deepEqual(LRU.parse('lru://foo:bar,bar:baz'), {foo: 'bar', bar: 'baz'})
    })
  })
})
