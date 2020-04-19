export * from './lib/embetty'
function debugEnabled() {
  return window.localStorage.embettyDebug === 'true'
}
if (debugEnabled()) {
  console.log(`embetty-version: ${require('./package.json').version}`)
}
