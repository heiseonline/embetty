// Serves the example pages together with the server's routes on one origin,
// as the pages expect (data-embetty-server="."), and rebuilds the component
// on changes. The server reads embetty.js on every request, so a reload
// picks up the new build.
// Server settings such as TWITTER_BEARER_TOKEN come from embetty-server/.env,
// the same file `bun run dev` in embetty-server reads.
import { spawn } from 'bun'
import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import { app } from '../embetty-server/src/app'

const ROOT = path.join(import.meta.dir, '..')
const EXAMPLE = path.join(ROOT, 'example')
const DEFAULT_PORT = 9000
const PORT = Number(process.env.PORT) || DEFAULT_PORT

process.env.VALID_ORIGINS ??= '*'

function exampleFile(url = '/') {
  const { pathname } = new URL(url, 'http://localhost')
  const file = path.join(EXAMPLE, pathname === '/' ? 'index.html' : pathname)
  return file.startsWith(`${EXAMPLE}${path.sep}`) ? Bun.file(file) : undefined
}

spawn([process.execPath, 'build.ts', '--watch'], {
  cwd: path.join(ROOT, 'embetty'),
  stdout: 'inherit',
  stderr: 'inherit',
})

async function serve(req: IncomingMessage, res: ServerResponse) {
  const file = exampleFile(req.url)
  if (!file || !(await file.exists())) {
    app(req, res)
    return
  }
  res.setHeader('Content-Type', file.type)
  res.end(new Uint8Array(await file.arrayBuffer()))
}

createServer((req, res) => void serve(req, res)).listen(PORT, () => {
  process.stdout.write(`Examples on http://localhost:${PORT}\n`)
})
