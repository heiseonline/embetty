import { describe, expect, it } from 'bun:test'
import { MastodonStatus } from './mastodon'

describe(`${MastodonStatus.name}.parseUrl`, () => {
  it.each([
    [
      'https://mastodon.social/@heiseonline/123',
      { instance: 'mastodon.social', statusId: '123' },
    ],
    [
      'https://Social.Heise.DE:8443/@user/42',
      { instance: 'social.heise.de:8443', statusId: '42' },
    ],
    [
      'http://mastodon.social/@user/1',
      { instance: 'mastodon.social', statusId: '1' },
    ],
  ])('parses %s', (statusUrl, expected) => {
    expect(MastodonStatus.parseUrl(statusUrl)).toEqual(expected)
  })

  it.each([
    'not a url',
    'ftp://mastodon.social/@user/1',
    'https://mastodon.social/@user/abc',
    'https://mastodon.social/@user/1/extra',
    'https://user:pass@mastodon.social/@user/1',
    'https://evil.test@mastodon.social/@user/1',
    'https://mastodon.social/@user/1?x=1',
    'https://mastodon.social/@user/1#x',
  ])('rejects %s', (statusUrl) => {
    expect(() => MastodonStatus.parseUrl(statusUrl)).toThrow(
      'Invalid mastodon status url',
    )
  })
})
