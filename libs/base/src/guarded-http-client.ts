import axios, {
  AxiosInstance,
  CreateAxiosDefaults,
  LookupAddressEntry,
} from 'axios'
import { promises as dns } from 'dns'
import { Agent as HttpAgent } from 'http'
import { Agent as HttpsAgent } from 'https'
import ipaddr from 'ipaddr.js'
import { isIP } from 'net'

export type AddressPolicy = (address: string) => boolean

export type Resolver = (hostname: string) => Promise<readonly string[]>

export interface RequestTarget {
  protocol: string
  hostname: string
}

export class ForbiddenTargetError extends Error {
  override name = 'ForbiddenTargetError'

  constructor(readonly target: string, reason: string) {
    super(`Refusing to request ${target}: ${reason}`)
  }
}

const ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set(['http:', 'https:'])

const DEFAULT_TIMEOUT_MS = 5000
const DEFAULT_MAX_CONTENT_LENGTH = 10_485_760 // 10 MiB
const DEFAULT_MAX_REDIRECTS = 5

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
      // eslint-disable-next-line unicorn/prefer-regexp-test -- ipaddr.js CIDR match, not String#match
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
) {
  return async (hostname: string): Promise<[LookupAddressEntry[]]> => {
    const addresses = await resolve(hostname)
    const forbidden = addresses.find((address) => !isAllowedAddress(address))

    if (forbidden !== undefined) {
      throw new ForbiddenTargetError(hostname, `resolves to ${forbidden}`)
    }

    // axios derives the address family itself.
    return [addresses.map((address) => ({ address }))]
  }
}

export interface GuardedHttpClientOptions {
  isAllowedAddress?: AddressPolicy
  resolve?: Resolver
}

/**
 * HTTP client for URLs that come from untrusted input (embed IDs or remote
 * API responses): only http(s), only public addresses, bounded responses.
 */
export function createGuardedHttpClient({
  isAllowedAddress = isPublicAddress,
  resolve = resolveAll,
}: GuardedHttpClientOptions = {}): AxiosInstance {
  // axios lets per-request options replace these instead of merging them, so
  // they are reapplied to every request below.
  const guard = {
    httpAgent: new HttpAgent({ keepAlive: true }),
    httpsAgent: new HttpsAgent({ keepAlive: true }),
    maxContentLength: DEFAULT_MAX_CONTENT_LENGTH,
    maxRedirects: DEFAULT_MAX_REDIRECTS,
    // A proxy would make guardedLookup() check the proxy, not the target.
    proxy: false,
    lookup: guardedLookup(isAllowedAddress, resolve),
    beforeRedirect: (options) => {
      assertAllowedTarget(
        {
          protocol: String(options.protocol),
          hostname: String(options.hostname),
        },
        isAllowedAddress,
      )
    },
    transport: undefined,
    socketPath: null,
  } satisfies CreateAxiosDefaults

  const client = axios.create({ ...guard, timeout: DEFAULT_TIMEOUT_MS })

  client.interceptors.request.use((config) => {
    assertAllowedTarget(new URL(client.getUri(config)), isAllowedAddress)

    // axios' timeout only covers the time until the response headers arrive;
    // a slowly trickling body would hold the connection open indefinitely.
    const deadline = AbortSignal.timeout(config.timeout || DEFAULT_TIMEOUT_MS)
    const signal =
      config.signal instanceof AbortSignal
        ? AbortSignal.any([config.signal, deadline])
        : deadline

    return Object.assign(config, guard, { signal })
  })

  return client
}
