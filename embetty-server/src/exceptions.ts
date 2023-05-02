import messages, { BAD_REQUEST, FORBIDDEN, NOT_FOUND } from 'http-status'

export class HttpException extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
  }
}

export class BadRequestException extends HttpException {
  constructor(message = messages['400']) {
    super(message, BAD_REQUEST)
  }
}

export class NotFoundException extends HttpException {
  constructor(message = messages['404']) {
    super(message, NOT_FOUND)
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = messages['403']) {
    super(message, FORBIDDEN)
  }
}
