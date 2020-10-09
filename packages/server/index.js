const { NotFound } = require('./lib/exceptions')
const { URL } = require('url')
const Embetty = require('@heise/embetty-base')
const express = require('express')
const helmet = require('helmet')
const logger = require('morgan')
const nunjucks = require('nunjucks')
const routes = require('./routes')

const app = express()

nunjucks
  .configure('views', {
    autoescape: true,
    express: app,
  })
  .addGlobal('urlFor', (path) => {
    const urlBase = process.env.URL_BASE
    if (!urlBase) throw new Error('URL_BASE not set.')
    const url = new URL(path, urlBase)
    return url.toString().replace(/\/$/, '')
  })

app.set('embetty', new Embetty())

app.use(
  logger(process.env.NODE_ENV === 'production' ? 'short' : 'dev', {
    skip: (_req, _res) => process.env.NODE_ENV === 'test',
  })
)

app.use(
  helmet({
    frameguard: false,
    hsts: false,
  })
)
app.use('/', routes)

app.use((req, res, next) => {
  next(NotFound)
})

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  if (err.statusCode >= 500) console.error(err)
  res.sendStatus(err.statusCode)
})

module.exports = app
