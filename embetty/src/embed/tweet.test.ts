import Tweets from '.../../../tweets.json'
import { createTweet, getFetchSpy } from '../test/lib/util'
import './tweet'

beforeEach(() => {
  document.body.innerHTML = ''
  jest
    .spyOn(Date.prototype, 'toLocaleString')
    .mockReturnValue('10/03/2013, 15:07:53')

  jest
    .spyOn(Date.prototype, 'toISOString')
    .mockReturnValue('2013-03-10T14:07:53.000Z')
})

describe.skip('Tweet', () => {
  it('should fetch remote data', async () => {
    const spy = await getFetchSpy(Tweets.text)
    const { element } = await createTweet(Tweets.text)
    expect(element._data?.data.id).toEqual(Tweets.text)
    expect(element._fetched).toBeTruthy()
    expect(spy).toHaveBeenCalledWith('/tweet/934029337019416579')
  })

  it('should generate the tweet header', async () => {
    await getFetchSpy(Tweets.text)
    const { query } = await createTweet(Tweets.text)
    expect(query('header img')).toBeTruthy()
    expect(query('header span strong')).toBeTruthy()
    expect(query('header span a')).toBeTruthy()
  })

  it('should generate the tweet body', async () => {
    await getFetchSpy(Tweets.text)
    const { query } = await createTweet(Tweets.text)
    expect(query('article')).toBeTruthy()
    expect(query('article p')).toBeTruthy()
    expect(query('article time')).toBeTruthy()
  })

  it('should show images', async () => {
    await getFetchSpy(Tweets.image)
    const { query } = await createTweet(Tweets.image)
    expect(query('#media img')).toBeTruthy()
  })

  it('should contain a time tag', async () => {
    await getFetchSpy(Tweets.text)
    const { query } = await createTweet(Tweets.text)
    const time = query('time')
    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/
    expect(datePattern.test(time.getAttribute('datetime')!)).toBeTruthy()
    expect(time.textContent?.length).toBeGreaterThan(5)
  })

  it('a[target=_blank] should have a [rel=noopener] attribute', async () => {
    await getFetchSpy(Tweets.link)
    const { element } = await createTweet(Tweets.link)
    const links = [...element.shadowRoot!.querySelectorAll('a[target=_blank')]
    expect(links).toHaveLength(4)

    links.forEach((link) => {
      expect(link.getAttribute('rel')).toBe('noopener')
    })
  })

  it('tweet link should contain the username and the tweet id', async () => {
    await getFetchSpy(Tweets.text)
    const { element } = await createTweet(Tweets.text)
    const links = [...element.shadowRoot!.querySelectorAll('.tweet__link')]
    expect(links).toHaveLength(1)
    // @ts-ignore
    expect(links[0].getAttribute('href')).toBe(
      'https://twitter.com/SiLVAFiSH/status/934029337019416579',
    )
  })

  describe('Tweet body', () => {
    it('should replace hash tags', async () => {
      await getFetchSpy(Tweets.text)
      const { query } = await createTweet(Tweets.text)
      const a = query(
        'article a[href="https://twitter.com/hashtag/Wochenende"]',
      )
      expect(a.textContent).toBe('#Wochenende')
    })

    it('should replace @user', async () => {
      await getFetchSpy(Tweets.answeredTweet)
      const { query, element } = await createTweet(Tweets.answeredTweet)
      const a = query('article a[href="https://twitter.com/VictorVEnciso"]')
      expect(element.shadowRoot?.innerHTML).toMatchSnapshot()
      expect(a.textContent).toBe('@VictorVEnciso')
    })

    it('should not output the image link when displaying the image', async () => {
      await getFetchSpy(Tweets.image)
      const { element } = await createTweet(Tweets.image)
      const text = element.fullText
      expect(text).not.toContain('https://t.co/wLy5Asq3z0')
    })

    it('should show tweet only without include-thread attribute', async () => {
      const { element } = await createTweet(Tweets.reply)
      expect(element.shadowRoot!.querySelector('embetty-tweet')).toBeNull()
    })

    it('should show thread and inherit include-thread attribute on being set', async () => {
      await getFetchSpy(Tweets.reply)
      const { element } = await createTweet(Tweets.reply, {
        'include-thread': '',
      })
      const parent = element.shadowRoot!.querySelector('embetty-tweet')
      expect(parent?.hasAttribute('include-thread')).toBeTruthy()
    })
  })
})
