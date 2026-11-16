// @vitest-environment happy-dom
import { afterEach, describe, expect, it, mock } from 'bun:test'
import { Embed } from '../embed'
import { createElement, mockServerResponse } from '../test/lib/util'
import mastodonCard from '../test/fixtures/mastodon-card.json'
import tweetLink from '../test/fixtures/tweet-941595208298483712.json'
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
