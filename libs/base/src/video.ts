import { Embed } from './embed'

export abstract class Video<T, U = T> extends Embed<T, U> {
  constructor(id: string, options: any) {
    super(id, options)
  }

  abstract get posterImageUrl(): string | undefined

  async getPosterImage() {
    if (!this.posterImageUrl) {
      return undefined
    }

    return this.embetty.getBinary({ url: this.posterImageUrl })
  }
}
