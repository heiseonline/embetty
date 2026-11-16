import { afterAll, beforeAll, expect } from 'bun:test'
import { once } from 'node:events'
import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { app } from '../../app'

export type Get = (path: string, init?: RequestInit) => Promise<Response>

/** Serves the app on a free port while the calling test file runs. */
export function serveApp(): Get {
  let server: Server
  let origin = ''

  beforeAll(async () => {
    server = app.listen(0, '127.0.0.1')
    await once(server, 'listening')
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  })

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections()
        server.close(() => resolve())
      }),
  )

  return (path, init) =>
    fetch(`${origin}${path}`, { ...init, redirect: 'manual' })
}

const MIN_IMAGE_BYTES = 100

export async function expectImage(response: Response, type: RegExp) {
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toMatch(type)
  const { byteLength } = await response.arrayBuffer()
  expect(byteLength).toBeGreaterThan(MIN_IMAGE_BYTES)
  expect(response.headers.get('content-length')).toBe(String(byteLength))
}

export async function expectHtml(response: Response): Promise<string> {
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toMatch(/html/)
  return response.text()
}
