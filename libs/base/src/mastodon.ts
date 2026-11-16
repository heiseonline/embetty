import { MastodonStatusData, MastodonStatusResponse } from '@embetty/types'
import { Embed, EmbedOptions, EmbettyRequest } from './embed'
import { InvalidUpstreamResponseError } from './request-cache'

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export interface MastodonStatusUrl {
  /** Host including a non-default port, e.g. `mastodon.social`. */
  instance: string
  statusId: string
}

const STATUS_PATH = /^\/@[^/]+\/(\d+)$/

function tryParseUrl(url: string): URL | undefined {
  try {
    return new URL(url)
  } catch {
    return undefined
  }
}

export class MastodonStatus extends Embed<MastodonStatusData> {
  instance: string
  statusId: string

  constructor(id: string, options: EmbedOptions) {
    super(id, options)

    const { instance, statusId } = MastodonStatus.parseUrl(id)
    this.instance = instance
    this.statusId = statusId
  }

  static parseUrl(statusUrl: string): MastodonStatusUrl {
    const url = tryParseUrl(statusUrl)
    const statusId = url?.pathname.match(STATUS_PATH)?.[1]

    if (
      !url ||
      !statusId ||
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error('Invalid mastodon status url')
    }

    return { instance: url.host, statusId }
  }

  get apiUrl(): string {
    return `https://${this.instance}/api/v1/statuses/${this.statusId}`
  }

  // Any server can answer here, so the shape is checked before use.
  assertMastodonStatusData(
    data: MastodonStatusResponse | undefined,
  ): asserts data is MastodonStatusData {
    const invalid = (reason: string) =>
      new InvalidUpstreamResponseError(this.apiUrl, reason)

    if (typeof data !== 'object' || data === null) {
      throw invalid('not an object')
    }
    if ('error' in data) {
      throw invalid(`error ${JSON.stringify(data.error)}`)
    }
    if (
      typeof data.content !== 'string' ||
      typeof data.account !== 'object' ||
      data.account === null ||
      !Array.isArray(data.media_attachments)
    ) {
      throw invalid('not a status')
    }
  }

  get mastodonStatusData(): MastodonStatusData {
    const data = this.data

    this.assertMastodonStatusData(data)

    return data
  }

  get profileImageUrl() {
    return this.mastodonStatusData.account.avatar
  }

  getProfileImage() {
    const url = this.profileImageUrl
    return url ? this.embetty.getImage({ url }) : undefined
  }

  get media() {
    return (this.mastodonStatusData.media_attachments ?? [])
      .map((attachment) => attachment)
      .filter(isDefined)
  }

  getImageUrl(index = 0) {
    return this.media[index]?.url
  }

  async getImage(index = 0) {
    const imageUrl = this.getImageUrl(index)

    return imageUrl ? this.embetty.getImage({ url: imageUrl }) : undefined
  }

  get linkImageUrl(): string | undefined {
    this.assertMastodonStatusData(this.data)
    return this.data.card?.image ?? undefined
  }

  getLinkImage() {
    const url = this.linkImageUrl

    if (!url) {
      return undefined
    }

    return this.embetty.getImage({ url })
  }

  get _requestOptions(): EmbettyRequest {
    return {
      url: this.apiUrl,
    } satisfies EmbettyRequest
  }

  get type() {
    return 'mastodon'
  }
}
