import assert from 'assert'
import { BadRequestException, NotFoundException } from '../exceptions'

describe('Exceptions', () => {
  it('#BadRequest', () => {
    assert.strictEqual(new BadRequestException().statusCode, 400)
  })

  it('#NotFound', () => {
    assert.strictEqual(new NotFoundException().statusCode, 404)
  })
})
