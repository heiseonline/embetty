#!/usr/bin/env node

const {URL} = require('url')
const config = require('./webpack.config')
const Embetty = require('@heise/embetty-base')
const embettyRoutes = require('@heise/embetty-server/routes')
const fs = require('fs-extra')
const ghpages = require('gh-pages')
const path = require('path')
const puppeteer = require('puppeteer')
const request = require('request-promise-native')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const createServer = config => new Promise((resolve, reject) => {
  const compiler = webpack(config, (err, stats) => {
    if (err) return reject(err)

    const server = new WebpackDevServer(compiler, {
      contentBase: './example',
      before: app => {
        app.set('embetty', new Embetty())
        app.use(embettyRoutes)
      },
      disableHostCheck: true,
    }).listen()
    resolve(server)
  })
})

const downloadAsset = async (url, baseDir) => {
  const {pathname} = new URL(url)
  const targetFile = path.join(baseDir, pathname)
  const response = await request.get(url, {encoding: null})
  console.log('Writing:', targetFile)
  return fs.outputFile(targetFile, response)
}

const launchServer = async () => {
  const server = await createServer(config)
  let {address, family, port} = server.address()
  address = family === 'IPv6' ? `[${address}]` : address
  return `http://${address}:${port}`
}

const download = async (baseDir, url) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const urls = []

  page.on('request', request => { urls.push(request.url()) })

  await page.goto(url, {waitUntil: 'networkidle0'})
  await Promise.all(urls.map(url => downloadAsset(url, baseDir)))
  await browser.close()
}

const main = async () => {
  const url = await launchServer()
  const baseDir = path.join(__dirname, '.gh-pages')
  await fs.emptyDir(baseDir)
  await download(baseDir, `${url}/index.html`)
  await download(baseDir, `${url}/tweet.html`)
  await download(baseDir, `${url}/video.html`)
  await ghpages.publish(baseDir)
  process.exit(0)
}

try {
  main()
} catch (error) {
  console.error(error)
}
