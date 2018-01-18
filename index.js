const {NotFound} = require('./lib/exceptions')
const Embetty = require('@heise/embetty-base')
const express = require('express')
const helmet = require('helmet')
const logger = require('morgan')
const routes = require('./routes')

const app = express()

app.set('embetty', new Embetty())

app.use(logger(process.env.NODE_ENV === 'production' ? 'short' : 'dev', {
  skip: (req, res) => process.env.NODE_ENV === 'test'
}))

app.use(helmet())
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
