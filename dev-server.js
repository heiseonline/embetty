#!/usr/bin/env node

const config = require('./webpack.config')
const Embetty = require('@heise/embetty-base')
const embettyRoutes = require('@heise/embetty-server/routes')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const PORT = process.env.PORT || 9000

config.entry = config.entry.embetty

const server = new WebpackDevServer(webpack(config), {
  hot: true,
  compress: true,
  contentBase: './example',
  before: app => {
    app.set('embetty', new Embetty())
    app.use(embettyRoutes)
  },
  disableHostCheck: true,
  stats: {
    colors: true
  },
})

server.listen(PORT)
