const { start, restore } = require('@heise/request-promise-native-record')
const assert = require('assert')
const path = require('path')

start({ folder: path.join(__dirname, 'fixtures') })

const Embed = require('../lib/embed')
const Embetty = require('..')

afterEach(restore)

class EmbettyMock extends Embetty {
  constructor(sleep = 0) {
    super()
    this.sleep = sleep
  }

  async get(url, options) {
    await new Promise((resolve, reject) => {
      setTimeout(resolve, this.sleep)
    })
    return super.get(url, options)
  }
}

class MyEmbed extends Embed {
  get _requestOptions() {
    return { uri: 'http://www.heise.de' }
  }
}

describe('Embed', () => {
  it('should retrieve data', async () => {
    const e = new MyEmbed(123, { embetty: new EmbettyMock() })
    await e.retrieve()
    assert.ok(e.data.includes('<html'))
  })

  it('default timeout should be 2000 ms', () => {
    const e = new MyEmbed(123)
    assert.strictEqual(e.requestTimeout, 2000)
  })

  it('should cancel long running requests', async () => {
    const e = new MyEmbed(123, {
      embetty: new EmbettyMock(200),
      requestTimeout: 20,
    })
    try {
      await e.retrieve()
      throw new Error('Request was not canceled')
    } catch (error) {
      assert.ok(/TIMEDOUT/.test(error.message))
    }
  })
})
