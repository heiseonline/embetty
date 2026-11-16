import express, { Express, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import logger from 'morgan'
import { classify } from './errors'
import { NotFoundException } from './exceptions'
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

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const { status, upstream } = classify(err)

  if (upstream) {
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : err
    console.warn(`${req.method} ${req.originalUrl} -> ${status}:`, reason)
  } else if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
    console.error(err)
  }

  res.sendStatus(status)
})
