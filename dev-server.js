#!/usr/bin/env node
const config = require('./webpack.config')
const Embetty = require('@heise/embetty-base')
const tweet = require('@heise/embetty-server/routes/tweet')
const video = require('@heise/embetty-server/routes/video')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const PORT = process.env.PORT || 9000

config.entry.embetty = config.entry.embetty.concat([
  `webpack-dev-server/client?http://localhost:${PORT}`,
  'webpack/hot/dev-server',
])
config.plugins.push(new webpack.HotModuleReplacementPlugin())

const server = new WebpackDevServer(webpack(config), {
  hot: true,
  compress: true,
  contentBase: './example',
  before: app => {
    app.set('embetty', new Embetty())
    app.use('/tweet', tweet)
    app.use('/video', video)
  },
  disableHostCheck: true,
  stats: {
    colors: true
  },
})

server.listen(PORT)
