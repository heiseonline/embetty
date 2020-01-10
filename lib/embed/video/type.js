export default class BaseType {
  constructor(element) {
    this.element = element
    this.defaultWidth = 1600
    this.defaultHeight = 900
  }

  get width() {
    return this.element.getAttribute('width') || this.defaultWidth
  }

  get height() {
    return this.element.getAttribute('height') || this.defaultHeight
  }
}
