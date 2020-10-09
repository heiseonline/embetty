const Embed = require('./embed')

module.exports = class Video extends Embed {
  constructor(id, options) {
    super(id, options)
    if (!this._requestOptions) this._retrieved = true
  }

  getPosterImage() {
    return this.embetty.getBinary(this.posterImageUrl)
  }

  toJSON() {
    return {}
  }
}
