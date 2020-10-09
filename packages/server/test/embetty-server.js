const app = require('..')
const assert = require('assert')
const request = require('supertest')

describe('embetty-server', () => {
  it('/ is 404', async () => {
    await request(app)
      .get('/')
      .expect(404)
  })

  it('should not send a "x-powered-by" header', async () => {
    const response = await request(app).get('/')
    assert.ok(!('x-powered-by' in response.headers))
  })

  it('should provide the version', async () => {
    const response = await request(app).get('/version')
    assert.strictEqual(response.text, require('../package.json').version)
  })
})
