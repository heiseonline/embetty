import crypto from 'crypto'

export const env = (key: string) => {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value
}

// /!\ TODO FIXME sort recursively
export const stringify = (object: object) =>
  JSON.stringify(object, Object.keys(object).sort())

export const hash = (object: object) => {
  const sha256 = crypto.createHash('sha256')
  sha256.update(stringify(object))
  return sha256.digest('base64').toString()
}

// Bumped whenever cached entries must not be served anymore: 2 after
// outgoing requests were guarded, 3 when the response type joined the key.
const CACHE_KEY_VERSION = 3

export const hashRequest = ({
  url,
  responseType,
}: {
  url: string
  responseType: string
}) => hash({ url, responseType, version: CACHE_KEY_VERSION })
