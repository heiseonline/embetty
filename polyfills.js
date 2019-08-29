require('whatwg-fetch')

try {
  /* eslint no-eval: "warn" */
  eval(require('@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'))
} catch (error) {}

require('@webcomponents/webcomponentsjs')
require('intersection-observer')
require('core-js/web/url')
require('regenerator-runtime/runtime')
