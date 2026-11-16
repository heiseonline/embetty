import { describe, expect, it } from 'bun:test'
import { LRU } from './cache/lru'
import { Embetty } from './embetty'
import { MastodonStatus } from './mastodon'
import { InvalidUpstreamResponseError } from './request-cache'

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

describe(`${MastodonStatus.name}#assertMastodonStatusData`, () => {
  const status = new MastodonStatus('https://mastodon.social/@a/1', {
    embetty: new Embetty(new LRU('lru://', { ttl: 60 })),
  })

  it.each([
    ['null', null],
    ['a number', 42],
    ['an API error', { error: 'Record not found' }],
    ['an object without status fields', { id: '1' }],
  ])('rejects %s', (_, data) => {
    expect(() => status.assertMastodonStatusData(data as never)).toThrow(
      InvalidUpstreamResponseError,
    )
  })
})
