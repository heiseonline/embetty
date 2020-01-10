const DEFAULT_WIDTH = 1600
const DEFAULT_HEIGHT = 900

export default class BaseType {
  constructor(element) {
    this.element = element
  }

  get width() {
    return this.element.getAttribute('width') || DEFAULT_WIDTH
  }

  get height() {
    return this.element.getAttribute('height') || DEFAULT_HEIGHT
  }
}
