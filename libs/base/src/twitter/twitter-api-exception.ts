import { TwitterError } from '@embetty/types'

export const TwitterErrorType = {
  NotFound: 'https://api.twitter.com/2/problems/resource-not-found',
} as const

export class TwitterApiException extends Error {
  readonly notFound: boolean

  constructor(public readonly error: TwitterError) {
    super(error.detail)

    this.notFound = error.type === TwitterErrorType.NotFound
  }
}
