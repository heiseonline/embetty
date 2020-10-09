const assert = require('assert')
const Exceptions = require('../lib/exceptions')

describe('Exceptions', () => {
  it('#BadRequest', () => {
    assert.strictEqual(Exceptions.BadRequest.statusCode, 400)
  })

  it('#NotFound', () => {
    assert.strictEqual(Exceptions.NotFound.statusCode, 404)
  })
})
