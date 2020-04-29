// import 'core-js'
// import 'regenerator-runtime/runtime
import 'whatwg-fetch'

try {
  /* eslint no-eval: "warn" */
  eval(require('@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js'))
} catch (error) {
  console.log(error)
}

import '@webcomponents/webcomponentsjs'
import 'intersection-observer'
