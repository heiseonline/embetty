import { createFacebookVideo, getFetchSpy } from '../../../test/lib/util'
import '../../video'

describe.skip('Facebook Video', () => {
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

  it('should load the facebook player after click', async () => {
    const { query, element } = await createFacebookVideo('10156049485672318')
    // @ts-ignore
    element._data = { canonicalUrl: 'abc' }
    expect(query('iframe')).toBeNull()
    element.activate()
    expect(query('iframe')).toBeDefined()
  })
})
