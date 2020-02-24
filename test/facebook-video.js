const { start, restore } = require('@heise/request-promise-native-record')
const assert = require('assert')
const path = require('path')

start({ folder: path.join(__dirname, 'fixtures') })

const Embetty = require('../')
const FacebookVideo = require('../lib/facebook-video')

afterEach(restore)

const embetty = new Embetty()
const createVideo = id => new FacebookVideo(id, { embetty })

describe('Facebook Video', () => {
  it('should construct', () => {
    assert.doesNotThrow(() => { createVideo('123') })
  })

  it('should of the type "facebook"', () => {
    const t = createVideo('10156049485672318')
    assert.strictEqual(t.type, 'facebook')
  })

  it('should resolve the canonical url of the video', async () => {
    const t = createVideo('10156049485672318')
    await t.retrieve()
    assert.strictEqual(t.canonicalUrl, 'https://www.facebook.com/heiseonline/videos/10156049485672318/')
  })
})

