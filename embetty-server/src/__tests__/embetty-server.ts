/* eslint-disable jest/expect-expect */
import assert from 'assert'
import request from 'supertest'
import { app } from '../app'

describe('embetty-server', () => {
  it('/ is 404', async () => {
    await request(app).get('/').expect(404)
  })

  it('should not send a "x-powered-by" header', async () => {
    const response = await request(app).get('/')
    assert.ok(!('x-powered-by' in response.headers))
  })

  it('should provide the version', async () => {
    const response = await request(app).get('/version')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
    const expected = require('../../package.json').version

    expect(response.text).toBe(JSON.stringify({ version: expected }))
  })
})
