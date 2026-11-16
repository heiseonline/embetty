// @vitest-environment happy-dom
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { Embed } from '../embed'
import { createElement, mockServerResponse } from '../test/lib/util'
import mastodonCard from '../test/fixtures/mastodon-card.json'
import tweetReply from '../test/fixtures/tweet-916618051906428928.json'
import tweetLink from '../test/fixtures/tweet-941595208298483712.json'
import type Video from './video'
import './video'
import './mastodon'
import './tweet'

// Statuses come from any Mastodon-compatible server and tweets from anyone,
// so their content must not be able to run script on the embedding page.

const SCRIPT_ATTRIBUTES = '[onerror], [onclick], [onmouseover], [onload]'

async function renderMastodon(changes: object) {
  mockServerResponse({ ...mastodonCard, ...changes })
  const { element } = await createElement<Embed<unknown>>('embetty-mastodon', {
    status: `https://mastodon.social/@Mastodon/${mastodonCard.id}`,
  })
  await element.becomesVisible()
  return element.shadowRoot!
}

async function renderTweet(text: string) {
  mockServerResponse({ ...tweetLink, data: { ...tweetLink.data, text } })
  const { element } = await createElement<Embed<unknown>>('embetty-tweet', {
    status: tweetLink.data.id,
  })
  await element.becomesVisible()
  return element.shadowRoot!
}

const hrefs = (root: ShadowRoot) =>
  Array.from(root.querySelectorAll('a'), (a) => a.getAttribute('href') ?? '')

afterEach(() => {
  mock.restore()
  document.body.innerHTML = ''
})

describe('Mastodon content', () => {
  it('drops elements and attributes that can run script', async () => {
    const root = await renderMastodon({
      content:
        '<p>Hi<img src="x" onerror="alert(1)"><script>alert(2)</script>' +
        '<iframe src="https://evil.test"></iframe>' +
        '<a href="https://example.com" onclick="alert(3)">link</a></p>',
    })
    expect(root.innerHTML).toContain(
      '<p>Hi<a href="https://example.com">link</a></p>',
    )
    expect(root.querySelector(SCRIPT_ATTRIBUTES)).toBeNull()
  })

  it('keeps formatting and unwraps unknown elements', async () => {
    const root = await renderMastodon({
      content: '<p><strong>bold</strong> <marquee>moving</marquee><br></p>',
    })

    expect(root.innerHTML).toContain('<p><strong>bold</strong> moving<br></p>')
  })

  it('only links to http(s) URLs', async () => {
    const root = await renderMastodon({
      content: '<p><a href="javascript:alert(1)">x</a></p>',
      account: { ...mastodonCard.account, url: 'javascript:alert(2)' },
      card: { ...mastodonCard.card, url: 'javascript:alert(3)' },
    })

    expect(hrefs(root).filter((href) => /^javascript:/i.test(href))).toEqual([])
  })
})

describe('Tweet text', () => {
  it('cannot break out of hashtag and mention links', async () => {
    const root = await renderTweet(
      '#a"onmouseover="alert(1) @b"onmouseover="alert(2) <img src=x onerror=alert(3)>',
    )

    expect(root.querySelector(SCRIPT_ATTRIBUTES)).toBeNull()
    expect(root.querySelector('article > p img')).toBeNull()
  })

  it('shows the entities Twitter escapes as characters', async () => {
    const root = await renderTweet('Fish &amp; Chips &lt;3')

    expect(root.querySelector('article > p')!.textContent).toBe(
      'Fish & Chips <3',
    )
  })
})

describe('Mastodon status attribute', () => {
  it('only becomes a link if it is an http(s) URL', async () => {
    mockServerResponse(mastodonCard)
    const { element } = await createElement<Embed<unknown>>(
      'embetty-mastodon',
      {
        status:
          'javascript:alert(document.domain)//https://mastodon.social/@a/1',
      },
    )
    await element.becomesVisible()

    expect(
      hrefs(element.shadowRoot!).filter((href) => /^javascript:/i.test(href)),
    ).toEqual([])
  })
})

describe('Mastodon link attributes', () => {
  it('cannot keep window.opener for new tabs', async () => {
    const root = await renderMastodon({
      content:
        '<p><a href="https://evil.test" target="x" rel="opener x-noopener">x</a></p>',
    })
    const rel = root
      .querySelector('a[href="https://evil.test"]')!
      .getAttribute('rel')!

    expect(rel.split(/\s+/)).toContain('noopener')
    expect(rel.split(/\s+/)).not.toContain('opener')
  })

  it('drops foreign elements with their content', async () => {
    const root = await renderMastodon({
      content:
        '<p>a<svg><script>alert(1)</script><style>p{}</style></svg>b</p>',
    })

    const article = root.querySelector('article')!
    // happy-dom parses foreign content less faithfully than browsers, so
    // only the outcome that matters is checked.
    expect(article.textContent).not.toContain('alert(1)')
    expect(article.querySelector('p svg, p script, p style')).toBeNull()
  })
})

describe('Video attributes', () => {
  async function activate(type: string, attributes: Record<string, string>) {
    mockServerResponse({ canonicalUrl: 'https://www.facebook.com/1' })
    const { element } = await createElement<Video<unknown>>('embetty-video', {
      type,
      ...attributes,
    })
    // An invalid ID may refuse to render at all; it just must not inject.
    await element.becomesVisible().catch(() => undefined)
    try {
      element.activate()
    } catch {
      // Same.
    }
    return element.shadowRoot!
  }

  it.each(['youtube', 'vimeo'])(
    'cannot inject markup into the %s player through video-id',
    async (type) => {
      const root = await activate(type, {
        'video-id': 'x"></iframe><img src=x onerror=alert(1)><iframe x="',
      })

      expect(root.querySelector('img, [onerror]')).toBeNull()
    },
  )

  it.each(['youtube', 'vimeo'])(
    'only passes a number as start-at to the %s player',
    async (type) => {
      const root = await activate(type, {
        'video-id': type === 'youtube' ? 'm6UOo2YGbIE' : '223099532',
        'start-at': '1"><img src=x onerror=alert(1)>',
      })

      expect(root.querySelector('img, [onerror]')).toBeNull()
      expect(root.querySelector('iframe')!.getAttribute('src')).toMatch(
        /(start=|#t=)0$/,
      )
    },
  )
})

describe('Reply threads', () => {
  async function answeredTweets(repliedTo: string) {
    const data = {
      ...tweetReply,
      data: {
        ...tweetReply.data,
        referenced_tweets: [{ type: 'replied_to', id: repliedTo }],
      },
    }
    mockServerResponse(data)
    const { element } = await createElement<Embed<unknown>>('embetty-tweet', {
      status: tweetReply.data.id,
      'include-thread': '',
    })
    await element.becomesVisible()
    return element.shadowRoot!.querySelectorAll('embetty-tweet').length
  }

  it('shows the answered tweet', async () => {
    expect(await answeredTweets('1')).toBe(1)
  })

  it('stops at a tweet answering itself', async () => {
    expect(await answeredTweets(tweetReply.data.id)).toBe(0)
  })
})
