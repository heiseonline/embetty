import { createFacebookVideo, getFetchSpy } from '../../../../test/lib/util'
import '../../video'

describe('Facebook Video', () => {
  beforeAll(async () => {
    await getFetchSpy('10156049485672318')
  })

  it('should provide no poster image', async () => {
    await getFetchSpy('10156049485672318')
    const { query } = await createFacebookVideo('10156049485672318', {
      'poster-image': '',
    })
    expect(query('img')).toBeNull()
  })

  // flaky
  it.skip('should provide the given poster image', async () => {
    const posterImage = 'http://www.test.de/facebook'
    const { query } = await createFacebookVideo('10156049485672318', {
      'poster-image': posterImage,
    })
    expect(query('img').getAttribute('src')).toBe(posterImage)
  })

  it('should load the facebook player after click', async () => {
    const { query, element } = await createFacebookVideo('10156049485672318')
    expect(query('iframe')).toBeNull()
    element.activate()
    expect(query('iframe')).toBeDefined()
  })
})
