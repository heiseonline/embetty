import { TwitterError } from '@embetty/types'

export enum TwitterErrorType {
  NotFound = 'https://api.twitter.com/2/problems/resource-not-found',
}

export class TwitterApiException extends Error {
  notFound = false

  constructor(public readonly error: TwitterError) {
    super(error.detail)

    this.notFound = error.type === TwitterErrorType.NotFound
  }
}
