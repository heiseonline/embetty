import { describe, expect, it } from 'bun:test'
import { version } from '../../package.json'
import { serveApp } from './lib/serve'

describe('embetty-server', () => {
  const get = serveApp()

  it('/ is 404', async () => {
    expect((await get('/')).status).toBe(404)
  })

  it('should not send a "x-powered-by" header', async () => {
    const response = await get('/')
    expect(response.headers.has('x-powered-by')).toBe(false)
  })

  it('should provide the version', async () => {
    const response = await get('/version')
    expect(await response.json()).toEqual({ version })
  })
})
