import Video from '../video'

const DEFAULT_WIDTH = 1600
const DEFAULT_HEIGHT = 900

export default abstract class BaseType {
  element: Video
  url: any

  constructor(element: Video) {
    this.element = element
  }

  get width() {
    return this.element.getAttribute('width') || DEFAULT_WIDTH
  }

  get height() {
    return this.element.getAttribute('height') || DEFAULT_HEIGHT
  }

  abstract get iframe(): string
  abstract get posterImageUrl(): string
}
