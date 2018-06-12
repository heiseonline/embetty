const {start} = require('@heise/request-promise-native-record')
const assert = require('assert')
const path = require('path')
const request = require('supertest')

start({ folder: path.join(__dirname, 'fixtures') })
const app = require('..')

const Tweets = {
  s200: '934029337019416579',
  s404: '999999999999999999999999999999999999999999999999',
  s400: 'abc'
}

describe('Tweet', () => {
  it('/tweet/:id => 404', async () => {
    await request(app)
      .get(`/tweet/${Tweets.s404}`)
      .expect(404)
  })

  it('/tweet/:id => 400', async () => {
    await request(app)
      .get(`/tweet/${Tweets.s400}`)
      .expect(400)
  })

  it('/tweet/:id.amp => 200', async () => {
    const response = await request(app)
      .get(`/tweet/${Tweets.s200}.amp`)
      .expect('Content-Type', /html/)
      .expect(200)
    const expected = '<embetty-tweet status="934029337019416579"></embetty-tweet>'
    assert.ok(response.text.includes(expected))
  })

  it('/tweet/:id => 200', async () => {
    const response = await request(app)
      .get(`/tweet/${Tweets.s200}`)
      .expect('Content-Type', /json/)
      .expect(200)
    assert.equal(response.body.id_str, Tweets.s200)
  })

  it('/tweet/:id-profile-image => 404', async () => {
    await request(app)
      .get(`/tweet/${Tweets.s404}/profile-image`)
      .expect(404)
  })

  it('/tweet/:id-profile-image => 400', async () => {
    await request(app)
      .get(`/tweet/${Tweets.s400}-profile-image`)
      .expect(400)
  })

  it('/tweet/:id-profile-image => 200', async () => {
    const response = await request(app)
      .get(`/tweet/${Tweets.s200}-profile-image`)
      .expect('Content-Type', /png/)
      .expect(200)

    assert.ok(Buffer.isBuffer(response.body))
    const imageLength = Buffer.byteLength(response.body)
    assert.ok(imageLength > 100)
    assert.equal(response.headers['content-length'], imageLength)
  })

  it('/tweet/:id-images-:number => 400', async () => {
    await request(app)
      .get(`/tweet/${Tweets.s200}-images-abc`)
      .expect(400)
  })

  it('/tweet/:id-images-:number => 404', async () => {
    await request(app)
      .get(`/tweet/${Tweets.s200}-images-99`)
      .expect(404)
  })

  it('/tweet/:id-images-:number => 200', async () => {
    const response = await request(app)
      .get(`/tweet/${Tweets.s200}-images-0`)
      .expect('Content-Type', /jpeg/)
      .expect(200)

    assert.ok(Buffer.isBuffer(response.body))
    const imageLength = Buffer.byteLength(response.body)
    assert.ok(imageLength > 100)
    assert.equal(response.headers['content-length'], imageLength)
  })

  it('/tweet/:id-link-image => 200', async () => {
    const response = await request(app)
      .get('/tweet/934386458852495360-link-image')
      .expect('Content-Type', /jpeg/)
      .expect(200)

    assert.ok(Buffer.isBuffer(response.body))
    const imageLength = Buffer.byteLength(response.body)
    assert.ok(imageLength > 100)
    assert.equal(response.headers['content-length'], imageLength)
  })

  it('/tweet/:id-link-image => 404', async () => {
    await request(app)
      .get(`/tweet/${Tweets.s200}-link-image`)
      .expect(404)
  })
})
