import {createYoutubeVideo} from './lib/util'
import assert from 'assert'

afterEach(() => { document.body.innerHTML = '' })

describe('Youtube Video', () => {
  it('should provide the poster image', async () => {
    const {query} = await createYoutubeVideo('m6UOo2YGbIE')
    assert.equal(
      query('img').getAttribute('src'),
      '/video/youtube/m6UOo2YGbIE-poster-image'
    )
  })

  it('should load the youtube player after click', async () => {
    const {query, element} = await createYoutubeVideo('m6UOo2YGbIE')
    assert.ok(!query('iframe'))
    element.activate()
    assert.ok(query('iframe'))
  })

  it('should use the privacy-enhanced mode', async () => {
    const {query, element} = await createYoutubeVideo('m6UOo2YGbIE')
    element.activate()
    const iframeSrc = query('iframe').getAttribute('src')
    assert.ok(/^\/\/www\.youtube-nocookie\.com\//.test(iframeSrc))
  })
})
