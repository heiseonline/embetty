const embettyServer = require('@heise/embetty-server')

const server = embettyServer.listen()
const { port } = server.address()

module.exports = function(config) {
  config.set({
    browsers: [
      'ChromeHeadless',
      // 'bs_ie11_windows'
    ],
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
    },
    clearContext: false,
    customLaunchers: {
      bs_ie11_windows: {
        base: 'BrowserStack',
        os: 'Windows',
        os_version: '10',
        browser: 'ie',
        device: null,
        browser_version: '11.0',
      },
    },
    files: [
      'polyfills.js',
      'index.js',
      {
        pattern: 'test/*.js',
        watched: false,
        served: true,
        included: true,
      },
    ],
    frameworks: ['mocha'],
    preprocessors: {
      // 'test/*.js': ['webpack', 'sourcemap'],
      '**/*.js': ['webpack', 'sourcemap'],
    },
    proxies: {
      '/': `http://localhost:${port}/`,
    },
    reporters: ['mocha'],
    // reporters: ['mocha', 'BrowserStack'],
    webpack: require('./webpack.config.js'),
  })
}
