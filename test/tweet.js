const { start, restore } = require('@heise/request-promise-native-record')
const assert = require('assert')
const path = require('path')
const SimpleCache = require('./lib/simple-cache')
const Tweets = require('./tweets.json')

start({ folder: path.join(__dirname, 'fixtures') })

const Embetty = require('..')
const Tweet = require('../lib/tweet')

afterEach(restore)

const embetty = new Embetty(new SimpleCache())
const createTweet = id => new Tweet(id, { embetty })

describe('Tweet', () => {
  it('should construct', () => {
    assert.doesNotThrow(() => {
      createTweet('123')
    })
  })

  it('should only accept strings', () => {
    assert.throws(() => {
      createTweet(123)
    })
  })

  it('should retrieve remote information', async () => {
    const t = createTweet(Tweets.text)
    await t.retrieve()
    assert.strictEqual(t.data.id_str, Tweets.text)
  })

  it('should be able to be output as JSON', async () => {
    const t = createTweet(Tweets.text)
    await t.retrieve()
    const json = JSON.stringify(t)
    const data = JSON.parse(json)
    assert.strictEqual(data.id_str, Tweets.text)
  })

  it('should of the type "tweet"', () => {
    const t = createTweet(Tweets.text)
    assert.strictEqual(t.type, 'tweet')
  })

  describe('User', () => {
    it('should provide a getter for the profile image url', async () => {
      const t = createTweet(Tweets.text)
      await t.retrieve()
      assert.strictEqual(
        t.profileImageUrl,
        'http://pbs.twimg.com/profile_images/674199882773737473/HqVe72sQ_bigger.png'
      )
    })

    it('should provide the user profile image', async () => {
      const t = createTweet(Tweets.text)
      await t.retrieve()
      const image = await t.getProfileImage()
      assert.strictEqual(image.type, 'image/png')
      assert.ok(image.data.length > 100)
    })
  })

  describe('Media', () => {
    it('getImageUrl() defaults to first image', async () => {
      const t = createTweet(Tweets.image)
      const url = await t.getImageUrl()
      assert.strictEqual(
        url,
        'http://pbs.twimg.com/tweet_video_thumb/DMBr2ePW0AASEbV.jpg'
      )
      assert.strictEqual(url, await t.getImageUrl(0))
    })

    it('should not throw an exception if an image does not exist', done => {
      const t = createTweet(Tweets.image)
      t.getImageUrl(999)
        .then(() => done())
        .catch(done)
    })

    it('should provide tweet images', async () => {
      const t = createTweet(Tweets.image)
      const image = await t.getImage()
      assert.ok(Buffer.isBuffer(image.data), 'Image is a buffer')
      assert.strictEqual(image.type, 'image/jpeg')
      assert.ok(image.data.length > 100, 'Image is > 100 bytes')
    })

    it('should not throw an exception if an image does not exist', done => {
      const t = createTweet(Tweets.image)
      t.getImage(999)
        .then(() => done())
        .catch(done)
    })
  })

  describe('Link', () => {
    it('should retrieve information from the linked page', async () => {
      const t = createTweet(Tweets.link)
      await t.retrieve()

      assert.strictEqual(t.links.length, 1)
      const link = t.links[0]
      assert.strictEqual(
        link.url,
        'https://www.heise.de/newsticker/meldung/Flache-Erde-Tueftler-verschiebt-Raketenflug-3901531.html'
      )
      assert.strictEqual(
        link.image,
        'https://www.heise.de/imgs/18/2/3/2/5/0/9/6/rocket-38b7eefe16172f7b-407f5fd2cdedfec3.jpeg'
      )
      assert.strictEqual(
        link.description,
        'Der Beweis, dass die Erde flach statt rund ist, lässt weiter auf sich warten: US-Tüftler Mike Hughes hat keine Genehmigung für den Start seiner selbstgebauten…'
      )
      assert.strictEqual(
        link.title,
        '"Flache Erde"-Tüftler verschiebt Raketenflug |\n    heise online\n'
      )
    })

    it('should should provide the link image', async () => {
      const t = createTweet(Tweets.link)
      await t.retrieve()
      const image = await t.getLinkImage()
      assert.strictEqual(image.type, 'image/jpeg')
      assert.ok(image.data.length > 100)
    })

    it('should should not throw an exception if a link image does not exist', async () => {
      const t = createTweet(Tweets.text)
      await t.retrieve()
      assert.strictEqual(await t.getLinkImage(), undefined)
    })
  })
})
