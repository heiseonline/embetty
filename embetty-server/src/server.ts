import { app } from './app'

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const server = app.listen(process.env.PORT || 3000)

// eslint-disable-next-line no-console
console.log('Listening on port', server.address())
