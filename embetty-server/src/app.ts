import express, { Express, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import { INTERNAL_SERVER_ERROR } from 'http-status'
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

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode: number = INTERNAL_SERVER_ERROR
  if (err instanceof HttpException) {
    statusCode = err.statusCode
  }

  if (statusCode >= INTERNAL_SERVER_ERROR) {
    console.error(err)
  }

  res.sendStatus(statusCode)
})
