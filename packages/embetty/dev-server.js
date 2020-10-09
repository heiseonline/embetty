#!/usr/bin/env node

const config = require('./webpack.config')
const Embetty = require('../base')
const tweet = require('../server/routes/tweet')
const video = require('../server/routes/video')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const DEFAULT_PORT = 9000
const PORT = process.env.PORT || DEFAULT_PORT

config.entry.embetty = config.entry.embetty.concat([
  `webpack-dev-server/client?http://localhost:${PORT}`,
  'webpack/hot/dev-server',
])
config.plugins.push(new webpack.HotModuleReplacementPlugin())

const server = new WebpackDevServer(webpack(config), {
  hot: true,
  compress: true,
  contentBase: './example',
  before: (app) => {
    app.set('embetty', new Embetty())
    app.use('/tweet', tweet)
    app.use('/video', video)
  },
  disableHostCheck: true,
  stats: {
    colors: true,
  },
})

server.listen(PORT)
