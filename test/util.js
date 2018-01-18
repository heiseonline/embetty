const assert = require('assert')
const {env, hash, hashRequest, stringify} = require('../lib/util')

describe('Util', () => {
  it('#env()', () => {
    process.env.XFOO = 'bar'
    assert.equal(env('XFOO'), 'bar')
  })

  it('#stringify()', () => {
    const expected = '{"a":2,"x":{"a":2,"z":1},"z":1}'
    assert.equal(stringify({z: 1, a: 2, x: {z: 1, a: 2}}), expected)
    assert.equal(stringify({a: 2, x: {z: 1, a: 2}, z: 1}), expected)
  })

  it('#hash()', () => {
    assert.equal(hash({z: 1, a: 2, x: {z: 1, a: 2}}), 'a+e4a7mHXQSDMlDb0THIL2IJ13PxWwHYZnPjFX3YxEk=')
    assert.equal(hash({x: {z: 1, a: 2}, a: 2, z: 1}), 'a+e4a7mHXQSDMlDb0THIL2IJ13PxWwHYZnPjFX3YxEk=')
  })

  it('#hashRequest()', () => {
    const expected = '6FKA0G+m1wenf2NgYBm1wo2QuhodNEF1E5iTBQ8uDMM='
    const options1 = {uri: 'http://localhost:8080'}
    assert.equal(hashRequest(options1), expected)
    assert.equal(options1.uri, 'http://localhost:8080')

    assert.equal(hashRequest({uri: 'http://localhost:8081'}), expected)
  })
})
