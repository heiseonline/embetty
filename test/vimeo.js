import {createVimeoVideo} from './lib/util'
import assert from 'assert'

afterEach(() => { document.body.innerHTML = '' })

describe('Vimeo Video', () => {
  it('should provide the poster image', async () => {
    const {query} = await createVimeoVideo('1084537')
    assert.equal(
      query('img').getAttribute('src'),
      '/video/vimeo/1084537-poster-image'
    )
  })

  it('should load the youtube player after click', async () => {
    const {query, element} = await createVimeoVideo('1084537')
    assert.ok(!query('iframe'))
    element.activate()
    assert.ok(query('iframe'))
  })

  it('[start-at]', async () => {
    const {element, query} = await createVimeoVideo('1084537', {'start-at': '97'})
    element.activate()
    const iframeSrc = query('iframe').getAttribute('src')
    assert.equal(iframeSrc, 'https://player.vimeo.com/video/1084537?autoplay=1&#t=97')
  })
})
