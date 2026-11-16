import {
  ForbiddenTargetError,
  HttpStatusError,
  InvalidUpstreamResponseError,
  ResponseTooLargeError,
  TooManyRedirectsError,
  UnsupportedContentTypeError,
} from '@embetty/base'
import { describe, expect, it } from 'bun:test'
import { classify } from '../errors'
import { NotFoundException } from '../exceptions'

const networkError = Object.assign(new Error('connect ECONNREFUSED'), {
  code: 'ECONNREFUSED',
})

describe(classify.name, () => {
  it.each([
    ['own HTTP exceptions', new NotFoundException(), 404, false],
    ['forbidden targets', new ForbiddenTargetError('x', 'y'), 403, false],
    ['upstream 404', new HttpStatusError(404, 'u'), 404, false],
    ['upstream 429', new HttpStatusError(429, 'u'), 502, true],
    ['oversized responses', new ResponseTooLargeError('u', 1), 502, true],
    ['redirect loops', new TooManyRedirectsError('u', 5), 502, true],
    [
      'non-image content',
      new UnsupportedContentTypeError('text/html'),
      502,
      true,
    ],
    ['network errors', networkError, 502, true],
    [
      'invalid upstream data',
      new InvalidUpstreamResponseError('u', 'x'),
      502,
      true,
    ],
    [
      'Node programming errors',
      Object.assign(new Error('headers sent'), {
        code: 'ERR_HTTP_HEADERS_SENT',
      }),
      500,
      false,
    ],
    ['timeouts', new DOMException('slow', 'TimeoutError'), 504, true],
    ['bugs', new TypeError('oops'), 500, false],
  ])('maps %s', (_, error, status, upstream) => {
    expect(classify(error)).toEqual({ status, upstream })
  })
})
