/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable jest/no-disabled-tests */
import assert from 'assert'
import request from 'supertest'
import { app } from '../app'

const Tweets = {
  s200: '934029337019416579',
  s404: '999999999999999999999999999999999999999999999999',
  s400: 'abc',
}

describe('Tweet', () => {
  beforeAll(() => {
    process.env.URL_BASE = 'https://example.com/embetty-server'
  })
  afterAll(() => {
    delete process.env.URL_BASE
  })

  it.skip('/tweet/:id => 404', async () => {
    await request(app).get(`/tweet/${Tweets.s404}`).expect(404)
  })

  it('/tweet/:id => 400', async () => {
    await request(app).get(`/tweet/${Tweets.s400}`).expect(400)
  })

  it.skip('/tweet/:id.amp => 200', async () => {
    const response = await request(app)
      .get(`/tweet/${Tweets.s200}.amp`)
      .expect('Content-Type', /html/)
      .expect(200)
    const expected =
      '<embetty-tweet status="934029337019416579"></embetty-tweet>'
    assert.ok(response.text.includes(expected))
  })

  it.skip('/tweet/:id => 200', async () => {
    const response = await request(app)
      .get(`/tweet/${Tweets.s200}`)
      .expect('Content-Type', /json/)
      .expect(200)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    assert.strictEqual(response.body.id_str, Tweets.s200)
  })

  it.skip('/tweet/:id-profile-image => 404', async () => {
    await request(app).get(`/tweet/${Tweets.s404}/profile-image`).expect(404)
  })

  it('/tweet/:id-profile-image => 400', async () => {
    await request(app).get(`/tweet/${Tweets.s400}-profile-image`).expect(400)
  })

  it.skip('/tweet/:id-profile-image => 200', async () => {
    const response = await request(app)
      .get(`/tweet/${Tweets.s200}-profile-image`)
      .expect('Content-Type', /png|jpg|jpeg/)
      .expect(200)

    assert.ok(Buffer.isBuffer(response.body))
    const imageLength = Buffer.byteLength(response.body)
    assert.ok(imageLength > 100)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    assert.strictEqual(response.headers['content-length'], `${imageLength}`)
  })

  it('/tweet/:id-images-:number => 400', async () => {
    await request(app).get(`/tweet/${Tweets.s200}-images-abc`).expect(400)
  })

  it.skip('/tweet/:id-images-:number => 404', async () => {
    await request(app).get(`/tweet/${Tweets.s200}-images-99`).expect(404)
  })

  it.skip('/tweet/:id-images-:number => 200', async () => {
    const response = await request(app)
      .get(`/tweet/${Tweets.s200}-images-0`)
      .expect('Content-Type', /jpeg/)
      .expect(200)

    assert.ok(Buffer.isBuffer(response.body))
    const imageLength = Buffer.byteLength(response.body)
    assert.ok(imageLength > 100)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    assert.strictEqual(response.headers['content-length'], `${imageLength}`)
  })

  it.skip('/tweet/:id-link-image => 200', async () => {
    const response = await request(app)
      .get('/tweet/934386458852495360-link-image')
      .expect('Content-Type', /jpeg/)
      .expect(200)

    assert.ok(Buffer.isBuffer(response.body))
    const imageLength = Buffer.byteLength(response.body)
    assert.ok(imageLength > 100)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    assert.strictEqual(response.headers['content-length'], `${imageLength}`)
  })

  it.skip('/tweet/:id-link-image => 404', async () => {
    await request(app).get(`/tweet/${Tweets.s200}-link-image`).expect(404)
  })
})
