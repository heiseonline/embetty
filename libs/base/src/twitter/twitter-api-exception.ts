import { TwitterError } from '@embetty/types'

// The API reports problem types under api.x.com since the rebranding; older
// responses (and cached ones) use api.twitter.com.
const NOT_FOUND_TYPES: ReadonlySet<string> = new Set([
  'https://api.x.com/2/problems/resource-not-found',
  'https://api.twitter.com/2/problems/resource-not-found',
])

export class TwitterApiException extends Error {
  readonly notFound: boolean

  constructor(public readonly error: TwitterError) {
    super(error.detail)

    this.notFound = NOT_FOUND_TYPES.has(error.type)
  }
}
