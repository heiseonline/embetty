import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { expectHtml, expectImage, serveApp } from './lib/serve'

const Tweets = {
  s200: '934029337019416579',
  s404: '999999999999999999999999999999999999999999999999',
  s400: 'abc',
}

// These hit the Twitter API, which needs credentials CI does not have.
const itWithTwitter = it.skipIf(!process.env.TWITTER_BEARER_TOKEN)

describe('Tweet', () => {
  const get = serveApp()
  const status = async (path: string) => (await get(path)).status

  beforeAll(() => {
    process.env.URL_BASE = 'https://example.com/embetty-server'
  })
  afterAll(() => {
    delete process.env.URL_BASE
  })

  itWithTwitter('/tweet/:id => 404', async () => {
    expect(await status(`/tweet/${Tweets.s404}`)).toBe(404)
  })

  it('/tweet/:id => 400', async () => {
    expect(await status(`/tweet/${Tweets.s400}`)).toBe(400)
  })

  itWithTwitter('/tweet/:id.amp => 200', async () => {
    const page = await expectHtml(await get(`/tweet/${Tweets.s200}.amp`))
    expect(page).toContain(
      `<embetty-tweet include-thread status="${Tweets.s200}"></embetty-tweet>`,
    )
  })

  itWithTwitter('/tweet/:id => 200', async () => {
    const response = await get(`/tweet/${Tweets.s200}`)
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toMatch(/json/)
    expect(await response.json()).toMatchObject({ id_str: Tweets.s200 })
  })

  itWithTwitter('/tweet/:id-profile-image => 404', async () => {
    expect(await status(`/tweet/${Tweets.s404}/profile-image`)).toBe(404)
  })

  it('/tweet/:id-profile-image => 400', async () => {
    expect(await status(`/tweet/${Tweets.s400}-profile-image`)).toBe(400)
  })

  itWithTwitter('/tweet/:id-profile-image => 200', async () => {
    await expectImage(
      await get(`/tweet/${Tweets.s200}-profile-image`),
      /png|jpg|jpeg/,
    )
  })

  it('/tweet/:id-images-:number => 400', async () => {
    expect(await status(`/tweet/${Tweets.s200}-images-abc`)).toBe(400)
  })

  itWithTwitter('/tweet/:id-images-:number => 404', async () => {
    expect(await status(`/tweet/${Tweets.s200}-images-99`)).toBe(404)
  })

  itWithTwitter('/tweet/:id-images-:number => 200', async () => {
    await expectImage(await get(`/tweet/${Tweets.s200}-images-0`), /jpeg/)
  })

  itWithTwitter('/tweet/:id-link-image => 200', async () => {
    await expectImage(await get('/tweet/934386458852495360-link-image'), /jpeg/)
  })

  itWithTwitter('/tweet/:id-link-image => 404', async () => {
    expect(await status(`/tweet/${Tweets.s200}-link-image`)).toBe(404)
  })
})
