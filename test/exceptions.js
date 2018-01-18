const assert = require('assert')
const Exceptions = require('../lib/exceptions')

describe('Exceptions', () => {
  it('#BadRequest', () => {
    assert.equal(Exceptions.BadRequest.statusCode, 400)
  })

  it('#NotFound', () => {
    assert.equal(Exceptions.NotFound.statusCode, 404)
  })
})
