#!/usr/bin/env node

const {URL} = require('url')
const config = require('./webpack.config')
const Embetty = require('@heise/embetty-base')
const embettyRoutes = require('@heise/embetty-server/routes')
const fs = require('fs-extra')
const path = require('path')
const puppeteer = require('puppeteer')
const request = require('request-promise-native')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

const createServer = config => new Promise((resolve, reject) => {
  config.devtool = 'none'
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
  if (await fs.pathExists(targetFile)) {
    console.log('skipping download:', targetFile)
    return
  }

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
  page.on('console', msg => { console[msg.type()](msg.text()) })

  await page.goto(url, {waitUntil: 'networkidle0'})
  await page.evaluate(async () => {
    const resolveOnInitialized = element => {
      return new Promise(resolve => {
        element.on('initialized', async () => {
          console.log('initialized:', element.outerHTML)
          const answeredTweets = element.answeredTweets
          if (!answeredTweets) return resolve()
          await Promise.all([...answeredTweets].map(resolveOnInitialized))
          resolve()
        })
        element.becomesVisible()
      })
    }

    const embeds = [...document.querySelectorAll('embetty-tweet, embetty-video')]
    return Promise.all(embeds.map(resolveOnInitialized))
  })

  console.log('Downloading assets ...')
  await Promise.all(urls.map(url => downloadAsset(url, baseDir)))
  console.log('Assets downloaded.')
  await browser.close()
}

const main = async () => {
  const url = await launchServer()
  const baseDir = path.join(__dirname, '.gh-pages')
  await fs.emptyDir(baseDir)
  await Promise.all([
    download(baseDir, `${url}/index.html`),
    download(baseDir, `${url}/tweet.html`),
    download(baseDir, `${url}/video.html`),
  ])
  process.exit(0)
}

try {
  main()
} catch (error) {
  console.error(error)
}
