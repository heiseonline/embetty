export default class BaseType {
  constructor(element) {
    this.element = element
  }

  get width() {
    return this.element.getAttribute('width') || 1600
  }

  get height() {
    return this.element.getAttribute('height') || 900
  }
}
