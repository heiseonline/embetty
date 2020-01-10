require('core-js')
require('regenerator-runtime/runtime')
require('whatwg-fetch')

try {
  /* eslint no-eval: "warn" */
  eval(require('@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'))
} catch (error) {
  throw new Error(error)
}

require('@webcomponents/webcomponentsjs')
require('intersection-observer')
