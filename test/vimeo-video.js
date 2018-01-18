const {start, restore} = require('@heise/request-promise-native-record')
const assert = require('assert')
const path = require('path')
const SimpleCache = require('./lib/simple-cache')

start({folder: path.join(__dirname, 'fixtures')})

const Embetty = require('../')
const VimeoVideo = require('../lib/vimeo-video')

afterEach(restore)

const embetty = new Embetty(new SimpleCache())
const createVideo = id => new VimeoVideo(id, { embetty })

describe('Vimeo Video', () => {
  it('should construct', () => {
    assert.doesNotThrow(() => { createVideo('abc123') })
  })

  it('should provide the poster image', async () => {
    const t = createVideo('223099532')
    await t.retrieve()
    const image = await t.getPosterImage()
    assert.equal(image.type, 'image/jpeg')
    assert.ok(image.data.length > 100)
  })
})
