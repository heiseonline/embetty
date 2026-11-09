import {
  ForbiddenTargetError,
  UnsupportedContentTypeError,
} from '@embetty/base'
import express, { Express, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import { BAD_GATEWAY, FORBIDDEN, INTERNAL_SERVER_ERROR } from 'http-status'
import logger from 'morgan'
import nunjucks from 'nunjucks'
import { URL } from 'url'
import { HttpException, NotFoundException } from './exceptions'
import routes from './routes'

export const app: Express = express()

nunjucks
  .configure('views', {
    autoescape: true,
    express: app,
  })
  .addGlobal('urlFor', (path: string) => {
    const urlBase = process.env.URL_BASE || 'http://localhost:3000'
    const url = new URL(path, urlBase)
    return url.toString().replace(/\/$/, '')
  })

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

const hasCause = (error: unknown): error is { cause: unknown } =>
  typeof error === 'object' &&
  error !== null &&
  'cause' in error &&
  error.cause !== undefined

// axios and follow-redirects wrap errors raised by @embetty/base's guard.
function rootCause(error: unknown): unknown {
  return hasCause(error) ? rootCause(error.cause) : error
}

function statusCodeOf(err: unknown): number {
  if (err instanceof HttpException) {
    return err.statusCode
  }

  const cause = rootCause(err)
  if (cause instanceof ForbiddenTargetError) {
    return FORBIDDEN
  }
  if (cause instanceof UnsupportedContentTypeError) {
    return BAD_GATEWAY
  }

  return INTERNAL_SERVER_ERROR
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = statusCodeOf(err)

  if (statusCode >= INTERNAL_SERVER_ERROR) {
    console.error(err)
  }

  res.sendStatus(statusCode)
})
