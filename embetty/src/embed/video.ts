import { observable, webcomponent } from '../decorators'
import { Embed } from '../embed'
import { Constructor } from '../interfaces'
import VideoImplementation from './video/type'
import * as Videos from './video/types'

const CSS =
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
  require('!css-loader!postcss-loader!sass-loader!./_video.scss').default.toString() as string

@webcomponent(
  'embetty-video',
  `
      <style>${CSS}</style>
      <button type="button" id="playbutton" aria-label="Abspielen">
        <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 2000 2000" fill="#fff" class="video-playbutton">
            <g transform="matrix(1.05356,0,0,1.03089,24.9824,-12.7689)">
              <ellipse cx="925.453" cy="982.42" rx="906.453" ry="926.382" style="fill:black;fill-opacity:0.65;stroke:white;stroke-width:70px;"></ellipse>
            </g>
            <g transform="matrix(1.6783e-16,2.74087,-2.70471,1.65616e-16,2834.26,-542.169)">
              <path d="M552.398,514.228C554.346,510.792 557.954,508.67 561.865,508.661C565.775,508.652 569.393,510.758 571.356,514.186C599.993,564.195 685.165,712.931 713.834,762.997C715.799,766.428 715.806,770.661 713.852,774.099C711.898,777.537 708.282,779.655 704.367,779.655L420.852,779.655C416.946,779.655 413.336,777.546 411.379,774.12C409.422,770.694 409.415,766.471 411.361,763.039C439.708,713.029 524.019,564.293 552.398,514.228Z" style="fill:white;"></path>
            </g>
        </svg>
      </button>
      <div id="poster">
      {{#posterImageUrl}}
        <img src="{{posterImageUrl}}">
      {{/posterImageUrl}}
      </div>
      <a href="https://www.heise.de/embetty" target="_blank" rel="noopener" id="powered-by" title="embetty - displaying remote content without compromising your privacy.">
        powered by {{{embettyLogo}}}
      </a>
    `,
)
@observable()
export default class Video<T> extends Embed<T> {
  impl: VideoImplementation<T>

  constructor() {
    super()

    this.impl = new this.Type(this)

    this.on('initialized', () => {
      this.playButton?.addEventListener(
        'click',
        () => {
          this.activate()
        },
        { once: true },
      )
    })
  }

  activate() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.shadowRoot!.innerHTML = this.impl.iframe
    this.emit('activated')
  }

  get playButton() {
    return this.shadowRoot!.querySelector('#playbutton')
  }

  get url() {
    return this.impl.url
  }

  get Type(): Constructor<VideoImplementation<T>> {
    const className = this.typeClass

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!Videos[this.typeClass]) {
      throw new Error(`"${className}" does not exist.`)
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Videos[className]
  }

  get typeClass() {
    const type = this.type

    if (!type) {
      throw new Error('No type specified.')
    }

    return `${type.charAt(0).toUpperCase() + type.slice(1)}Video`
  }

  get type() {
    return this.getAttribute('type')
  }

  get videoId(): string {
    const videoId = this.getAttribute('video-id')

    if (!videoId) {
      throw new Error('No video ID specified.')
    }

    return videoId
  }

  get posterImageUrl() {
    return this.getAttribute('poster-image') || this.impl.posterImageUrl
  }

  get startAt() {
    return this.getAttribute('start-at') || 0
  }
}
