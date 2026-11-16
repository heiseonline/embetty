import {
  ForbiddenTargetError,
  HttpStatusError,
  InvalidUpstreamResponseError,
  ResponseTooLargeError,
  TooManyRedirectsError,
  TwitterApiException,
  UnsupportedContentTypeError,
} from '@embetty/base'
import { HttpException } from './exceptions'
import { HttpStatus } from './http-status'

const isTimeout = (error: unknown) =>
  error instanceof Error && error.name === 'TimeoutError'

// System errors of the network stack (ECONNREFUSED, ENOTFOUND, ECONNRESET,
// ...), not Node's ERR_* codes, which signal bugs.
const isNetworkError = (error: unknown) =>
  error instanceof Error &&
  'code' in error &&
  typeof error.code === 'string' &&
  /^E[A-Z0-9]+$/.test(error.code)

/**
 * The status for an error, and whether it is a failure of an upstream
 * service rather than of this server. Upstream failures are expected (a
 * remote server can be slow or broken on purpose) and only logged briefly.
 */
export function classify(error: unknown): {
  status: number
  upstream: boolean
} {
  if (error instanceof HttpException) {
    return { status: error.statusCode, upstream: false }
  }
  if (error instanceof ForbiddenTargetError) {
    return { status: HttpStatus.FORBIDDEN, upstream: false }
  }
  // Unknown upstream IDs (a deleted video, ...) are unknown here as well.
  if (
    error instanceof HttpStatusError &&
    error.status === HttpStatus.NOT_FOUND
  ) {
    return { status: HttpStatus.NOT_FOUND, upstream: false }
  }
  if (isTimeout(error)) {
    return { status: HttpStatus.GATEWAY_TIMEOUT, upstream: true }
  }
  if (
    error instanceof HttpStatusError ||
    error instanceof InvalidUpstreamResponseError ||
    error instanceof UnsupportedContentTypeError ||
    error instanceof ResponseTooLargeError ||
    error instanceof TooManyRedirectsError ||
    error instanceof TwitterApiException ||
    isNetworkError(error)
  ) {
    return { status: HttpStatus.BAD_GATEWAY, upstream: true }
  }

  return { status: HttpStatus.INTERNAL_SERVER_ERROR, upstream: false }
}
