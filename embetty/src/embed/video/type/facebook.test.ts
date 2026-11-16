// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { createFacebookVideo, mockServerResponse } from '../../../test/lib/util'
import '../../video'

describe('Facebook Video', () => {
  beforeEach(() => {
    mockServerResponse({
      canonicalUrl: 'https://www.facebook.com/10156049485672318',
    })
  })

  afterEach(() => {
    mock.restore()
    document.body.innerHTML = ''
  })

  it('should provide no poster image', async () => {
    const { query } = await createFacebookVideo('10156049485672318', {
      'poster-image': '',
    })
    expect(query('img')).toBeNull()
  })

  it('should load the facebook player after click', async () => {
    const { query, element } = await createFacebookVideo('10156049485672318')
    element._data = { canonicalUrl: 'abc' }
    expect(query('iframe')).toBeNull()
    element.activate()
    expect(query('iframe')).toBeDefined()
  })
})
