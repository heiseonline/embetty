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
    const expected = require('../../package.json').version
    expect(response.text).toBe(JSON.stringify({ version: expected }))
  })
})
