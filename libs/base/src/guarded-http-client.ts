import { promises as dns, LookupAddress, LookupOptions } from 'node:dns'
import http, { IncomingHttpHeaders, IncomingMessage } from 'node:http'
import https from 'node:https'
import { isIP, LookupFunction } from 'node:net'
import ipaddr from 'ipaddr.js'

export type AddressPolicy = (address: string) => boolean

export type Resolver = (hostname: string) => Promise<readonly string[]>

export interface RequestTarget {
  protocol: string
  hostname: string
}

export interface GuardedRequestInit {
  headers?: Readonly<Record<string, string>>
  signal?: AbortSignal
  /** Covers the whole exchange including the body, in milliseconds. */
  timeout?: number
}

/**
 * `fetch` for URLs from untrusted input (embed IDs or remote API responses).
 * GET only, which is all embeds need.
 */
export type GuardedFetch = (
  url: string | URL,
  init?: GuardedRequestInit,
) => Promise<Response>

export class ForbiddenTargetError extends Error {
  override name = 'ForbiddenTargetError'

  constructor(
    readonly target: string,
    reason: string,
  ) {
    super(`Refusing to request ${target}: ${reason}`)
  }
}

export class ResponseTooLargeError extends Error {
  override name = 'ResponseTooLargeError'

  constructor(
    readonly target: string,
    limit: number,
  ) {
    super(`Response from ${target} exceeds ${limit} bytes`)
  }
}

export class TooManyRedirectsError extends Error {
  override name = 'TooManyRedirectsError'

  constructor(
    readonly target: string,
    limit: number,
  ) {
    super(`More than ${limit} redirects requesting ${target}`)
  }
}

const ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:'])
/* eslint-disable @typescript-eslint/no-magic-numbers -- HTTP status codes */
const REDIRECT_STATUSES: ReadonlySet<number> = new Set([
  301, 302, 303, 307, 308,
])
// The Response constructor rejects a body for these.
const NULL_BODY_STATUSES: ReadonlySet<number> = new Set([
  101, 103, 204, 205, 304,
])
/* eslint-enable @typescript-eslint/no-magic-numbers */
// Not forwarded to another origin on redirects, as in fetch.
const CREDENTIAL_HEADERS: ReadonlySet<string> = new Set([
  'authorization',
  'cookie',
])

const DEFAULT_TIMEOUT_MS = 5000
const MAX_CONTENT_LENGTH = 10_485_760 // 10 MiB
const MAX_REDIRECTS = 5

const GLOBAL_UNICAST_IPV6 = ipaddr.parseCIDR('2000::/3')
// Documentation prefix (RFC 9637), unknown to ipaddr.js 2.2.
const DOCUMENTATION_IPV6 = ipaddr.parseCIDR('3fff::/20')

// Everything except globally routable unicast (private, loopback, link-local,
// CGNAT, multicast, documentation, NAT64/6to4/Teredo, ...) is rejected.
// IPv4-mapped IPv6 addresses are judged by their embedded IPv4 address.
// ipaddr.js treats unassigned IPv6 space (e.g. ::/96, fec0::/10,
// 64:ff9b:1::/48) as unicast, hence the explicit 2000::/3 requirement.
export const isPublicAddress: AddressPolicy = (address) => {
  if (!ipaddr.isValid(address)) {
    return false
  }

  const parsed = ipaddr.process(address)
  return (
    parsed.range() === 'unicast' &&
    (parsed.kind() === 'ipv4' ||
      (parsed.match(GLOBAL_UNICAST_IPV6) && !parsed.match(DOCUMENTATION_IPV6)))
  )
}

const resolveAll: Resolver = async (hostname) => {
  const entries = await dns.lookup(hostname, { all: true })
  return entries.map(({ address }) => address)
}

export function assertAllowedTarget(
  { protocol, hostname }: RequestTarget,
  isAllowedAddress: AddressPolicy,
): void {
  if (!ALLOWED_PROTOCOLS.has(protocol)) {
    throw new ForbiddenTargetError(hostname, `protocol ${protocol}`)
  }

  // net.connect() skips the DNS lookup for IP literals, so guardedLookup()
  // never sees them.
  const host = hostname.replace(/^\[(.*)]$/, '$1')
  if (isIP(host) && !isAllowedAddress(host)) {
    throw new ForbiddenTargetError(hostname, 'address not allowed')
  }
}

// Checking the resolved addresses at connect time (instead of resolving the
// URL up front) leaves no window for DNS rebinding.
export function guardedLookup(
  isAllowedAddress: AddressPolicy,
  resolve: Resolver = resolveAll,
): LookupFunction {
  const check = async (
    hostname: string,
    family: LookupOptions['family'],
  ): Promise<LookupAddress[]> => {
    const wanted = { IPv4: 4, IPv6: 6 } as const
    const addresses = await resolve(hostname)
    const forbidden = addresses.find((address) => !isAllowedAddress(address))

    if (forbidden !== undefined) {
      throw new ForbiddenTargetError(hostname, `resolves to ${forbidden}`)
    }

    return addresses
      .map((address) => ({ address, family: isIP(address) }))
      .filter(
        (entry) =>
          !family ||
          entry.family ===
            (typeof family === 'string' ? wanted[family] : family),
      )
  }

  return (hostname, options, callback) => {
    check(hostname, options.family).then(
      (entries) => {
        const [first] = entries
        if (options.all) {
          callback(null, entries)
        } else if (first) {
          callback(null, first.address, first.family)
        } else {
          callback(new ForbiddenTargetError(hostname, 'no address'), '')
        }
      },
      (error: Error) => callback(error, ''),
    )
  }
}

function toHeaders(incoming: IncomingHttpHeaders): Headers {
  const headers = new Headers()
  for (const [name, value] of Object.entries(incoming)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) {
        headers.append(name, item)
      }
    }
  }
  return headers
}

function withoutCredentials(
  headers: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    Object.entries(headers).filter(
      ([name]) => !CREDENTIAL_HEADERS.has(name.toLowerCase()),
    ),
  )
}

interface Exchange {
  message: IncomingMessage
  body: Buffer
}

export interface GuardedFetchOptions {
  isAllowedAddress?: AddressPolicy
  resolve?: Resolver
}

/**
 * Only http(s), only public addresses, bounded responses. Built on node:http
 * because the global fetch offers no hook to check the addresses it connects
 * to.
 */
export function createGuardedFetch({
  isAllowedAddress = isPublicAddress,
  resolve = resolveAll,
}: GuardedFetchOptions = {}): GuardedFetch {
  const lookup = guardedLookup(isAllowedAddress, resolve)
  // Own agents: the global ones may be set up to use a proxy, which would
  // make the lookup check the proxy instead of the target.
  const agents = {
    'http:': new http.Agent({ keepAlive: true }),
    'https:': new https.Agent({ keepAlive: true }),
  } as const

  const exchange = (
    url: URL,
    headers: Readonly<Record<string, string>>,
    signal: AbortSignal,
  ): Promise<Exchange> =>
    new Promise((resolve, reject) => {
      const secure = url.protocol === 'https:'
      const request = (secure ? https : http).request(url, {
        agent: secure ? agents['https:'] : agents['http:'],
        headers,
        lookup,
      })

      const fail = (error: Error) => {
        signal.removeEventListener('abort', abort)
        request.destroy()
        reject(error)
      }
      // A DOMException (TimeoutError or AbortError), as with fetch.
      const abort = () => fail(signal.reason as Error)
      signal.addEventListener('abort', abort, { once: true })

      request.on('error', fail)
      request.on('response', (message) => {
        const tooLarge = () =>
          fail(new ResponseTooLargeError(url.href, MAX_CONTENT_LENGTH))

        if (Number(message.headers['content-length']) > MAX_CONTENT_LENGTH) {
          tooLarge()
          return
        }

        const chunks: Buffer[] = []
        let length = 0
        message.on('data', (chunk: Buffer) => {
          length += chunk.length
          if (length > MAX_CONTENT_LENGTH) {
            tooLarge()
          } else {
            chunks.push(chunk)
          }
        })
        message.on('error', fail)
        message.on('end', () => {
          signal.removeEventListener('abort', abort)
          resolve({ message, body: Buffer.concat(chunks) })
        })
      })

      request.end()
    })

  return async (input, { headers = {}, signal, timeout } = {}) => {
    const deadline = AbortSignal.timeout(timeout ?? DEFAULT_TIMEOUT_MS)
    const combined = signal ? AbortSignal.any([signal, deadline]) : deadline
    combined.throwIfAborted()

    let url = new URL(input)
    let requestHeaders = headers

    for (let redirects = 0; ; redirects++) {
      assertAllowedTarget(url, isAllowedAddress)
      const { message, body } = await exchange(url, requestHeaders, combined)
      const status = message.statusCode ?? 0
      const { location } = message.headers

      if (!REDIRECT_STATUSES.has(status) || !location) {
        return new Response(NULL_BODY_STATUSES.has(status) ? null : body, {
          status,
          statusText: message.statusMessage,
          headers: toHeaders(message.headers),
        })
      }

      if (redirects >= MAX_REDIRECTS) {
        throw new TooManyRedirectsError(String(input), MAX_REDIRECTS)
      }
      const next = new URL(location, url)
      if (next.origin !== url.origin) {
        requestHeaders = withoutCredentials(requestHeaders)
      }
      url = next
    }
  }
}
