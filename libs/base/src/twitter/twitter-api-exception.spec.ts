import { describe, expect, it } from 'bun:test'
import { TwitterApiException } from './twitter-api-exception'

const error = (type: string) => ({
  detail: 'Could not find post with id: [1].',
  title: 'Not Found Error',
  type,
  resource_type: 'tweet',
  resource_id: '1',
  parameter: 'id',
  value: '1',
})

describe(TwitterApiException.name, () => {
  it.each([
    'https://api.x.com/2/problems/resource-not-found',
    'https://api.twitter.com/2/problems/resource-not-found',
  ])('recognizes %s as not found', (type) => {
    expect(new TwitterApiException(error(type)).notFound).toBe(true)
  })

  it('treats other problems as errors', () => {
    expect(
      new TwitterApiException(
        error('https://api.x.com/2/problems/not-authorized-for-resource'),
      ).notFound,
    ).toBe(false)
  })
})
