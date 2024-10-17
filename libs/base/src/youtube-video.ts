import { Video } from './video'

export type YoutubeVideoData = Buffer

export class YoutubeVideo extends Video<YoutubeVideoData> {
  get _requestOptions(): undefined {
    return undefined
  }

  get type() {
    return 'youtube'
  }

  get posterImageUrl() {
    return `https://img.youtube.com/vi/${this.id}/maxresdefault.jpg`
  }
}
