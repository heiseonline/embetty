import { Video } from './video'

export type FacebookVideoData = never

export class FacebookVideo extends Video<
  FacebookVideoData,
  { canonicalUrl: string }
> {
  // The player only needs the canonical URL; the page itself is of no use.
  get _requestOptions(): undefined {
    return undefined
  }

  get type() {
    return 'facebook'
  }

  get canonicalUrl() {
    return `https://www.facebook.com/${this.id}`
  }

  get posterImageUrl() {
    return undefined
  }

  override toJSON() {
    return {
      canonicalUrl: this.canonicalUrl,
    }
  }
}
