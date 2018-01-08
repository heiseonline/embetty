const assert = require('assert')
const _Embetty = require('../lib/embetty')
const Tweet = require('../lib/tweet')

describe('Package', () => {
  it('should provide a main script', () => {
    assert.doesNotThrow(() => { require('..') })
  })

  it('exports the Embetty class', () => {
    const Embetty = require('..')
    assert.equal(Embetty, _Embetty)
  })

  it('Embetty contains the Tweet class', () => {
    const Embetty = require('..')
    assert.ok(Embetty.hasOwnProperty('Tweet'))
    assert.equal(Embetty.Tweet, Tweet)
  })
})
