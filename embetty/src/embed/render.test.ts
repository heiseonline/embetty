// @vitest-environment happy-dom
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test'
import { Embed } from '../embed'
import { createElement, mockServerResponse } from '../test/lib/util'
import mastodonCard from '../test/fixtures/mastodon-card.json'
import mastodonMedia from '../test/fixtures/mastodon-media.json'
import mastodonNoCard from '../test/fixtures/mastodon-nocard.json'
import tweetHashtags from '../test/fixtures/tweet-934029337019416579.json'
import tweetImages from '../test/fixtures/tweet-935819741947744256.json'
import tweetReply from '../test/fixtures/tweet-916618051906428928.json'
import tweetLink from '../test/fixtures/tweet-941595208298483712.json'
import './mastodon'
import './tweet'

// Markup only: styles are covered by the browser comparison, and whitespace
// between tags does not render.
const markup = (element: Embed<unknown>) =>
  element
    .shadowRoot!.innerHTML.replaceAll(/<style>.*?<\/style>/gs, '')
    .replaceAll(/>\s+</g, '><')
    .replaceAll(/\s+/g, ' ')
    .trim()

async function render(tag: string, attribute: string, data: unknown) {
  mockServerResponse(data)
  const { element } = await createElement<Embed<unknown>>(tag, {
    [attribute]: '1',
  })
  await element.becomesVisible()
  return markup(element)
}

beforeEach(() => {
  spyOn(Date.prototype, 'toLocaleString').mockReturnValue('10.3.2013, 15:07:53')
})

afterEach(() => {
  mock.restore()
  document.body.innerHTML = ''
})

describe('rendering', () => {
  it.each([
    ['with hashtags, media and a link', tweetHashtags],
    ['with several images', tweetImages],
    ['replying with mentions', tweetReply],
    ['with a link card', tweetLink],
  ])('renders a tweet %s', async (_, data) => {
    expect(await render('embetty-tweet', 'status', data)).toMatchSnapshot()
  })

  it.each([
    ['with a link card', mastodonCard],
    ['without a card', mastodonNoCard],
    ['with media', mastodonMedia],
  ])('renders a Mastodon status %s', async (_, data) => {
    const status = `https://mastodon.social/@Mastodon/${data.id}`
    mockServerResponse(data)
    const { element } = await createElement<Embed<unknown>>(
      'embetty-mastodon',
      { status },
    )
    await element.becomesVisible()
    expect(markup(element)).toMatchSnapshot()
  })
})
