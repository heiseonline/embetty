import { MastodonStatusData, MastodonStatusResponse } from '@embetty/types'
import { Embed, EmbedOptions, EmbettyRequest } from './embed'

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export class MastodonStatus extends Embed<MastodonStatusData> {
  instance: string
  statusId: string

  constructor(id: string, options: EmbedOptions<MastodonStatusData>) {
    super(id, options)

    const [, host, statusId] =
      id.match(/^https?:\/\/([^/]+)\/@[^/]+\/(\d+)$/) || []
    if (!host || !statusId) {
      throw new Error('Invalid mastodon status url')
    }

    this.instance = host
    this.statusId = statusId
  }

  get apiUrl(): string {
    return `https://${this.instance}/api/v1/statuses/${this.statusId}`
  }

  assertMastodonStatusData(
    data: MastodonStatusResponse | undefined,
  ): asserts data is MastodonStatusData {
    const error = data !== undefined && !('content' in data) && data.error

    if (error) {
      throw new Error('Mastodon API Error')
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
    return url ? this.embetty.getBinary({ url }) : undefined
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

    return imageUrl ? this.embetty.getBinary({ url: imageUrl }) : undefined
  }

  get linkImageUrl(): string {
    this.assertMastodonStatusData(this.data)
    return this.data?.card.image
  }

  getLinkImage() {
    const url = this.linkImageUrl

    if (!url) {
      return undefined
    }

    return this.embetty.getBinary({ url })
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
