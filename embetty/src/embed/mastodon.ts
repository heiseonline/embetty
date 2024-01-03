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
        <section>
          <a href="{{mastodonUrl}}" target="_blank" rel="noopener" class="meta-bar">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-back-up" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 14l-4 -4l4 -4" /><path d="M5 10h11a4 4 0 1 1 0 8h-1" /></svg>
              <span>{{repliesCount}}</span>
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-repeat" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3" /><path d="M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3" /></svg>
              <span>{{reblogCount}}</span>
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-star-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" stroke-width="0" fill="currentColor" /></svg>
              <span>{{favouriteCount}}</spam>
            </span>
          </a>
        </section>
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

  get favouriteCount() {
    return this._data?.favourites_count
  }

  get reblogCount() {
    return this._data?.reblogs_count
  }

  get repliesCount() {
    return this._data?.replies_count
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
