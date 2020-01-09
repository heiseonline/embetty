import { createFacebookVideo } from './lib/util'
import assert from 'assert'

describe('Facebook Video', () => {
  it('should provide the facebook poster image', async () => {
    const { query } = await createFacebookVideo('10156049485672318')
    assert.strictEqual(
      query('img').getAttribute('src'),
      'video/facebook/10156049485672318-poster-image'
    )
  })

  it('should load the facebook player after click', async () => {
    const { query, element } = await createFacebookVideo('10156049485672318')
    assert.ok(!query('iframe'))
    element.activate()
    assert.ok(query('iframe'))
  })
})
