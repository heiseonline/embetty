import { STATUS_CODES } from 'node:http'
import { HttpStatus } from './http-status'

export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message = STATUS_CODES[statusCode] ?? 'Error',
  ) {
    super(message)
  }
}

export class BadRequestException extends HttpException {
  constructor(message?: string) {
    super(HttpStatus.BAD_REQUEST, message)
  }
}

export class NotFoundException extends HttpException {
  constructor(message?: string) {
    super(HttpStatus.NOT_FOUND, message)
  }
}

export class ForbiddenException extends HttpException {
  constructor(message?: string) {
    super(HttpStatus.FORBIDDEN, message)
  }
}
