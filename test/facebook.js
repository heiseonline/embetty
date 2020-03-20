import { createFacebookVideo } from './lib/util'
import assert from 'assert'

describe('Facebook Video', () => {
  it('should provide no poster image', async () => {
    const { query } = await createFacebookVideo('10156049485672318', {
      'poster-image': '',
    })
    assert.ok(!query('img'))
  })

  it('should provide the given poster image', async () => {
    const posterImage = 'http://www.test.de/facebook'
    const { query } = await createFacebookVideo('10156049485672318', {
      'poster-image': posterImage,
    })
    assert.strictEqual(query('img').getAttribute('src'), posterImage)
  })

  it('should load the facebook player after click', async () => {
    const { query, element } = await createFacebookVideo('10156049485672318')
    assert.ok(!query('iframe'))
    element.activate()
    assert.ok(query('iframe'))
  })
})
