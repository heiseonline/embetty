import { describe, expect, it } from 'bun:test'
import { BadRequestException, NotFoundException } from '../exceptions'

describe('Exceptions', () => {
  it('#BadRequest', () => {
    expect(new BadRequestException().statusCode).toBe(400)
  })

  it('#NotFound', () => {
    expect(new NotFoundException().statusCode).toBe(404)
  })
})
