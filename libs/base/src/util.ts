import { AxiosRequestConfig } from 'axios'
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

export const hashRequest = ({ url }: AxiosRequestConfig) => hash({ url })
