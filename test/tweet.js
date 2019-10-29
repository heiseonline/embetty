import { createTweet } from './lib/util'
import assert from 'assert'
import Tweets from '@heise/embetty-base/test/tweets.json'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('Tweet', () => {
  it('should have a max width', async () => {
    const { element } = await createTweet(Tweets.text)
    assert.strictEqual(window.getComputedStyle(element).width, '642px')
  })

  it('should fetch remote data', async () => {
    const { element } = await createTweet(Tweets.text)
    assert.strictEqual(element._data.id_str, Tweets.text)
    assert.ok(element._fetched)
  })

  it('should generate the tweet header', async () => {
    const { query } = await createTweet(Tweets.text)
    assert.ok(query('header img'))
    assert.ok(query('header span strong'))
    assert.ok(query('header span a'))
  })

  it('should generate the tweet body', async () => {
    const { query } = await createTweet(Tweets.text)
    assert.ok(query('article'))
    assert.ok(query('article p'))
    assert.ok(query('article time'))
  })

  it('should show images', async () => {
    const { query } = await createTweet(Tweets.image)
    assert.ok(query('#media img'))
  })

  it('should contain a time tag', async () => {
    const { query } = await createTweet(Tweets.text)
    const time = query('time')
    assert.ok(time)
    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
    assert.ok(datePattern.test(time.getAttribute('datetime')))
    assert.ok(time.innerText.length > 5)
  })

  it('a[target=_blank] should have a [rel=noopener] attribute', async () => {
    const { element } = await createTweet(Tweets.link)
    const links = [...element.shadowRoot.querySelectorAll('a[target=_blank')]
    assert.strictEqual(links.length, 4)
    links.forEach(link => {
      assert.strictEqual(link.getAttribute('rel'), 'noopener')
    })
  })

  it('tweet link should contain the username and the tweet id', async () => {
    const { element } = await createTweet(Tweets.text)
    const links = [...element.shadowRoot.querySelectorAll('.tweet__link')]
    assert.strictEqual(links.length, 1)
    assert.ok(links[0].getAttribute('href').includes('SiLVAFiSH'))
    assert.ok(links[0].getAttribute('href').includes('934029337019416579'))
  })

  describe('Tweet body', () => {
    it('should replace hash tags', async () => {
      const { query } = await createTweet(Tweets.hashTag.valid)
      const a = query(
        'article a[href="https://twitter.com/hashtag/Wochenende"]'
      )
      assert.ok(a)
      assert.strictEqual(a.innerText, '#Wochenende')
    })

    it('should replace @user', async () => {
      const { query } = await createTweet(Tweets.answeredTweet)
      const a = query('article a[href="https://twitter.com/VictorVEnciso"]')
      assert.ok(a)
      assert.strictEqual(a.innerText, '@VictorVEnciso')
    })

    it('should not output the image link when displaying the image', async () => {
      const { element } = await createTweet(Tweets.image)
      const text = element.fullText
      assert.ok(!text.includes('https://t.co/wLy5Asq3z0'))
    })

    it('should show tweet only without include-thread attribute', async () => {
      const { element } = await createTweet(Tweets.reply)
      assert.strictEqual(element.shadowRoot.querySelector('embetty-tweet'), null)
    })

    it('should show tweet and thread due to include-thread attribute', async () => {
      const { element } = await createTweet(Tweets.reply, { 'include-thread': '' })
      assert.ok(element.shadowRoot.querySelector('embetty-tweet'))
    })
  })
})
