import { MastodonStatusData } from '@embetty/types'
import { observable, webcomponent } from '../decorators'
import { Embed } from '../embed'
import { parseHostname } from '../util'

const CSS =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
  require('!css-loader!postcss-loader!sass-loader!./mastodon.scss').default.toString() as string

const template = `
    <style>${CSS}</style>
      <header>
        <img src="{{profileImageUrl}}" />
        <span>
          <strong>{{userName}}</strong>
          <a href="{{profileUrl}}" target="_blank" rel="noopener" >@{{screenName}}</a>
        </span>
      </header>
      <article>
        <p>{{{ fullText }}}</p>
        {{#hasMedia}}
          <section class="media-{{media.length}}" id="media">
            {{#media}}
              <a target="_blank" href="{{imageUrl}}"><img src="{{imageUrl}}"></a>
            {{/media}}
          </section>
        {{/hasMedia}}

        {{#showLinkCard}}
          <a href="{{card.url}}" target="_blank" rel="noopener" id="links">
            <img src="{{linkImageUrl}}">
            <section id="link-body">
              <h3>{{card.title}}</h3>
              <span>{{linkHostname}}</span>
            </section>
          </a>
        {{/showLinkCard}}

        <a href="{{mastodonUrl}}" target="_blank" rel="noopener" id="created-at" class="tweet__link">
          <time datetime="{{createdAt.toISOString}}">{{createdAt.toLocaleString}}</time>
          via Mastodon
        </a>

        <a href="https://www.heise.de/embetty?wt_mc=link.embetty.poweredby" target="_blank" rel="noopener" id="powered-by" title="embetty - displaying remote content without compromising your privacy.">
          powered by {{{embettyLogo}}}</a>
      </article>
    `

@webcomponent('embetty-mastodon', template)
@observable()
export class Mastodon extends Embed<MastodonStatusData> {
  constructor(status: string, _options = {}) {
    super()

    if (status) {
      this.setAttribute('status', status)
    }
  }

  get status(): string {
    const status = this.getAttribute('status')

    if (!status) {
      throw new Error('Invalid status')
    }

    return status
  }

  // get mastodonInstanceUrl() {
  //   const [, host] =
  //     this._data?.url.match(/^https?:\/\/([^/]+)\/@[^/]+\/\d+$/) || []

  //   return host
  // }

  get url() {
    return this._api(`/mastodon/${this.status}`)
  }

  get mastodonUrl() {
    return this.status
  }

  get card() {
    return this._data?.card
  }

  assertData(
    data: MastodonStatusData | undefined,
  ): asserts data is MastodonStatusData {
    if (!data) {
      throw new Error('Invalid mastodon status data')
    }
  }

  get createdAt(): Date {
    const data = this._data
    this.assertData(data)

    return new Date(data.created_at)
  }

  get profileImageUrl() {
    return `${this.url}/profile-image`
  }

  get linkImageUrl() {
    return `${this.url}/link-image`
  }

  get fullText() {
    return this._data?.content
  }

  get profileUrl() {
    return this._data?.account.url
  }

  get userName() {
    return this._data?.account.username
  }

  get screenName() {
    return this._data?.account.display_name
  }

  get media() {
    return (this._data?.media_attachments ?? []).map((_key, index) => ({
      imageUrl: `${this.url}/images/${index}`,
    }))
  }

  get hasMedia() {
    const data = this._data
    this.assertData(data)
    return data.media_attachments.length > 0
  }

  get link() {
    return this._data?.card.url
  }

  get linkHostname() {
    const url = this.link
    return url ? parseHostname(url) : undefined
  }

  get showLinkCard() {
    return this._data?.card && this._data.media_attachments.length === 0
  }

  override async becomesVisible() {
    await super.becomesVisible()

    const linkImage = this.shadowRoot!.querySelector('#links img')
    if (linkImage) {
      linkImage.addEventListener('error', () => {
        linkImage.remove()
      })
    }
  }
}
