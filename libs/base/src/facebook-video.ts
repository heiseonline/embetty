import axios from 'axios'
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
    }
  }

  get type() {
    return 'facebook'
  }

  get canonicalUrl() {
    return axios.getUri(this._requestOptions)
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
