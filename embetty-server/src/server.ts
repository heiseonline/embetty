/* eslint-disable no-console */
import { version } from '../package.json'
import { app } from './app'

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const server = app.listen(process.env.PORT || 3000)

console.log('🐙 Embetty Server', version)
console.log('Listening on port', server.address())

// As PID 1 in a container, node has no default handlers for these signals,
// so without this `docker stop` waits for its timeout and then kills.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    server.close(() => process.exit(0))
    server.closeIdleConnections()
  })
}
