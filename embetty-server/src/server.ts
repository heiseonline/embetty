/* eslint-disable no-console */
import { version } from '../package.json'
import { app } from './app'

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const server = app.listen(process.env.PORT || 3000)

console.log('🐙 Embetty Server', version)
console.log('Listening on port', server.address())
