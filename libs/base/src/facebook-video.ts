import { EmbettyRequest } from './embed'
import { Video } from './video'

export type FacebookVideoData = never

export class FacebookVideo extends Video<
  FacebookVideoData,
  { canonicalUrl: string }
> {
  get _requestOptions(): EmbettyRequest {
    return {
      url: `https://www.facebook.com/${this.id}`,
      responseType: 'text',
    }
  }

  get type() {
    return 'facebook'
  }

  get canonicalUrl() {
    return this._requestOptions.url
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
