export * from './lib/embetty'
function debugEnabled() {
  return window.localStorage.embettyDebug === 'true'
}
if (debugEnabled()) {
  // eslint-disable-next-line no-undef
  console.log(`embetty-version: ${VERSION}`)
}
