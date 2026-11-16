import { EmbettyTweet, TweetData, User } from '@embetty/types'
import { observable, webcomponent } from '../decorators'
import { Embed } from '../embed'
import { each, Html, markup, raw, safeUrl, when } from '../html'
import { height, parseHostname } from '../util'
import CSS from './tweet.css'

const HEIGHT_OFFSET = 2

// The API returns text with &, < and > escaped, and only those.
const decodeTwitterEntities = (text: string) =>
  text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')

@webcomponent('embetty-tweet')
@observable()
export class Tweet extends Embed<EmbettyTweet> {
  template() {
    return markup`
    <style>${raw(CSS)}</style>
      <header>
        <img src="${this.profileImageUrl}" />
        <span>
          <strong>${this.userName}</strong>
          <a href="https://twitter.com/${this.screenName}" target="_blank" rel="noopener" >@${this.screenName}</a>
        </span>
      </header>
      <article>
        <p>${this.fullText}</p>
        ${when(
          this.hasImages,
          () => markup`
          <section class="media-${this.images.length}" id="media">
            ${each(
              this.images,
              ({ imageUrl }) => markup`
              <a target="_blank" href="${imageUrl}"><img src="${imageUrl}"></a>`,
            )}
          </section>`,
        )}
        ${when(
          this.hasAdditionalMedia,
          () => markup`
          <section class="media-hint">
            <a href="${this.twitterUrl}" target="_blank" rel="noopener">
              Weitere Inhalte des Posts auf x.com
            </a>
          </section>`,
        )}

        ${when(
          this.link,
          (link) => markup`
          <a href="${safeUrl(link.url)}" target="_blank" rel="noopener" id="links">
            <img src="${this.linkImageUrl}">
            <section id="link-body">
              <h3>${link.title}</h3>
              ${when(link.description, (description) => markup`<p>${description}</p>`)}
              <span>${this.linkHostname}</span>
            </section>
          </a>`,
        )}

        <a href="${this.twitterUrl}" target="_blank" rel="noopener" id="created-at" class="tweet__link">
          <time datetime="${this.createdAt.toISOString()}">${this.createdAt.toLocaleString()}</time>
          via X (Twitter)
          <svg id="xcorp-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 22.1 20" preserveAspectRatio="xMinYMin" style="height: 12px"><path id="path2" d="M17.4,0h3.4l-7.4,8.5L22.1,20h-6.8L10,13l-6.1,7H0.4l7.9-9.1L0,0h7l4.8,6.4L17.4,0z M16.2,18h1.9L6,1.9H4 L16.2,18z"/></svg>
        </a>

        <a href="https://www.heise.de/embetty?wt_mc=link.embetty.poweredby" target="_blank" rel="noopener" id="powered-by" title="embetty - displaying remote content without compromising your privacy.">
          powered by ${raw(this.embettyLogo)}</a>
      </article>
    `
  }

  parent?: Tweet

  constructor(status: string, parent?: Tweet, options = {}) {
    super()
    if (status) {
      this.setAttribute('status', status)
    }
    if ('include-thread' in options) {
      this.setAttribute('include-thread', '')
    }
    this.parent = parent

    this.on('initialized', () => {
      this.appendAnsweredTweet()
      this.fitCardHeight()
    })
  }

  appendAnsweredTweet() {
    if (
      !this.isReply ||
      !this.hasAttribute('include-thread') ||
      !this.answeredTweetId
    ) {
      return
    }
    const answered = new Tweet(this.answeredTweetId, this, {
      'include-thread': '',
    })

    answered.classList.add('answered')
    this.shadowRoot!.insertBefore(answered, this.shadowRoot!.firstChild)
  }

  // TODO: Reduce complexity of fitCardHeight()
  fitCardHeight() {
    if (!this.hasLinks) {
      return
    }

    const section = this.shadowRoot!.querySelector('#links')!
    const linkBody = this.shadowRoot!.querySelector('#link-body')!

    if (section.clientWidth === linkBody.clientWidth) {
      return
    }

    const p = section.querySelector('p')
    if (!p) {
      return
    }

    const imgHeight = height(section.querySelector<HTMLImageElement>('img')!)
    let counter = 0
    let last = ''

    while (height(section) - HEIGHT_OFFSET > imgHeight) {
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      if (++counter > 200) {
        break
      }
      if (last === p.textContent) {
        break
      }
      last = p.textContent!
      p.textContent = `${p.textContent?.replace(/\W*\s(\S)*$/, '') ?? ''}…`
    }
  }

  get answeredTweets() {
    return this.shadowRoot?.querySelectorAll('embetty-tweet')
  }

  get statusId(): string {
    const status = this.getAttribute('status')

    if (!status) {
      throw new Error('Invalid status')
    }

    return status
  }

  get url() {
    return this._api(`/tweet/${this.statusId}`)
  }

  get twitterUrl() {
    return `https://twitter.com/${this.user.username}/status/${this.statusId}`
  }

  assertData(data: TweetData | undefined): asserts data is TweetData {
    if (!data) {
      throw new Error('Invalid tweet data')
    }
  }

  get createdAt(): Date {
    this.assertData(this._data)

    return new Date(this._data.data.created_at)
  }

  get profileImageUrl() {
    return `${this.url}/profile-image`
  }

  get linkImageUrl() {
    return `${this.url}/link-image`
  }

  // Hashtags and mentions become links; everything else stays text.
  get fullText(): Html {
    const data = this._data?.data
    const text = decodeTwitterEntities(
      data?.note_tweet?.text ?? data?.text ?? '',
    )

    const parts: Html[] = []
    let last = 0
    for (const match of text.matchAll(/#([^\s-]+)|@(\w+)/g)) {
      const [token, hashtag, user] = match
      parts.push(markup`${text.slice(last, match.index)}`)
      parts.push(
        hashtag === undefined
          ? markup`<a href="https://twitter.com/${user}">${token}</a>`
          : markup`<a href="https://twitter.com/hashtag/${hashtag}">${token}</a>`,
      )
      last = match.index + token.length
    }
    parts.push(markup`${text.slice(last)}`)

    return each(parts, (part) => part)
  }

  get user(): User {
    const data = this._data
    this.assertData(data)

    const user = data.includes.users.find(
      (user) => user.id === data.data.author_id,
    )

    if (!user) {
      throw new Error('Invalid user data')
    }

    return user
  }

  get userName() {
    return this.user?.name
  }

  get screenName() {
    return this.user?.username
  }

  get images() {
    const images = (this._data?.includes.media ?? []).filter(
      (include) => include.type === 'photo',
    )

    return (images ?? []).map((_key, index) => ({
      imageUrl: `${this.url}/images/${index}`,
    }))
  }

  get hasAdditionalMedia() {
    return (
      this.images.length <
      (this._data?.data.attachments?.media_keys.length ?? 0)
    )
  }

  get hasImages() {
    return this.images.length > 0
  }

  get links() {
    return this._data?.linkMetas ?? []
  }

  get link() {
    return this.links[0]
  }

  get linkHostname() {
    const url = this.link?.url
    return url ? parseHostname(url) : undefined
  }

  get hasLinks() {
    return this.links.length > 0
  }

  get answeredTweetId() {
    return this._data?.data.referenced_tweets?.find(
      (tweet) => tweet.type === 'replied_to',
    )?.id
  }

  get isReply() {
    return !!this.answeredTweetId
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
