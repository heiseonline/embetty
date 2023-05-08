import { AxiosRequestConfig } from 'axios'
import crypto from 'crypto'

export const env = (key: string) => process.env[key]

// /!\ TODO FIXME sort recursively
export const stringify = (object: any) =>
  JSON.stringify(object, Object.keys(object).sort())

export const hash = (object: unknown) => {
  const sha256 = crypto.createHash('sha256')
  sha256.update(stringify(object))
  return sha256.digest('base64').toString()
}

export const hashRequest = ({ url }: AxiosRequestConfig) => hash({ url })
