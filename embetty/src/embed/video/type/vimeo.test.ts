import { createVimeoVideo } from '../../../test/lib/util'
import '../../video'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Vimeo Video', () => {
  it('should provide the poster image', async () => {
    const { query } = await createVimeoVideo('1084537')
    expect(query('img').getAttribute('src')).toBe(
      '/video/vimeo/1084537-poster-image',
    )
  })

  it('should provide the poster image overwritten via attribute', async () => {
    const posterImage = 'http://www.test.de/vimeo'
    const { query } = await createVimeoVideo('1084537', {
      'poster-image': posterImage,
    })
    expect(query('img').getAttribute('src')).toBe(posterImage)
  })

  it('should load the vimeo player after click', async () => {
    const { query, element } = await createVimeoVideo('1084537')
    expect(query('iframe')).toBeNull()
    element.activate()
    expect(query('iframe')).toBeDefined()
  })

  it('[start-at]', async () => {
    const { element, query } = await createVimeoVideo('1084537', {
      'start-at': '97',
    })
    element.activate()
    const iframeSrc = query('iframe').getAttribute('src')
    expect(iframeSrc).toBe(
      'https://player.vimeo.com/video/1084537?autoplay=1#t=97',
    )
  })
})
