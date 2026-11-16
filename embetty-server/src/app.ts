import {
  ForbiddenTargetError,
  HttpStatusError,
  UnsupportedContentTypeError,
} from '@embetty/base'
import express, { Express, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import { HttpException, NotFoundException } from './exceptions'
import { HttpStatus } from './http-status'
import routes from './routes'

export const app: Express = express()

app.use(
  logger(process.env.NODE_ENV === 'production' ? 'short' : 'dev', {
    skip: () => process.env.NODE_ENV === 'test',
  }),
)

app.use(
  helmet({
    frameguard: false,
    hsts: false,
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  }),
)
app.use('/', routes)

app.use((_req, _res, next) => {
  next(new NotFoundException())
})

function statusCodeOf(err: unknown): number {
  if (err instanceof HttpException) {
    return err.statusCode
  }

  if (err instanceof ForbiddenTargetError) {
    return HttpStatus.FORBIDDEN
  }
  // Unknown upstream IDs (a deleted video, ...) are unknown here as well.
  if (err instanceof HttpStatusError && err.status === HttpStatus.NOT_FOUND) {
    return HttpStatus.NOT_FOUND
  }
  if (err instanceof UnsupportedContentTypeError) {
    return HttpStatus.BAD_GATEWAY
  }

  return HttpStatus.INTERNAL_SERVER_ERROR
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = statusCodeOf(err)

  if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    console.error(err)
  }

  res.sendStatus(statusCode)
})
