import { EmbettyRequest } from './embed'
import { Video } from './video'

export interface VimeoVideoData {
  id: number
  title: string
  description: string
  url: string
  upload_date: string
  thumbnail_small: string
  thumbnail_medium: string
  thumbnail_large: string
  user_id: number
  user_name: string
  user_url: string
  user_portrait_small: string
  user_portrait_medium: string
  user_portrait_large: string
  user_portrait_huge: string
  stats_number_of_likes: number
  stats_number_of_plays: number
  stats_number_of_comments: number
  duration: number
  width: number
  height: number
  tags: string
  embed_privacy: string
}

export class VimeoVideo extends Video<VimeoVideoData[]> {
  get _requestOptions(): EmbettyRequest {
    return {
      url: `https://vimeo.com/api/v2/video/${this.id}.json`,
    }
  }

  get type() {
    return 'vimeo'
  }

  get posterImageUrl() {
    return this.data?.[0]?.thumbnail_large
  }
}
