import { createFacebookVideo, getFetchSpy } from '../../../../test/lib/util'
import assert from 'assert'
import '../../video'

jest.mock(
  '!css-loader!postcss-loader!sass-loader!./vimeo.scss',
  () => `vimeo.scss mock`,
  { virtual: true }
)
jest.mock(
  '!css-loader!postcss-loader!sass-loader!./youtube.scss',
  () => `vimeo.scss mock`,
  { virtual: true }
)
jest.mock(
  '!css-loader!postcss-loader!sass-loader!./vimeo.scss',
  () => `vimeo.scss mock`,
  { virtual: true }
)

describe('Facebook Video', () => {
  beforeAll(async () => {
    await getFetchSpy('10156049485672318')
  })

  it('should provide no poster image', async () => {
    await getFetchSpy('10156049485672318')
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
