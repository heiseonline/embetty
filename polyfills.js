require('babel-polyfill')
require('whatwg-fetch')

try {
  eval(require('raw-loader!@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'))
} catch (error) {}

require('@webcomponents/webcomponentsjs/webcomponents-bundle.js')
require('intersection-observer')
