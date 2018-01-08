import {createYoutubeVideo} from './lib/util'
import assert from 'assert'

afterEach(() => { document.body.innerHTML = '' })

describe('Youtube Video', () => {
  it('should provide the poster image', async () => {
    const {query} = await createYoutubeVideo('m6UOo2YGbIE')
    assert.equal(
      query('img').getAttribute('src'),
      '/video/youtube/m6UOo2YGbIE/poster-image'
    )
  })

  it('should load the youtube player after click', async () => {
    const {element, query} = await createYoutubeVideo('m6UOo2YGbIE')
    assert.ok(!query('iframe'))
    element.click()
    assert.ok(query('iframe'))
  })
})
