import { EmbettyTweet, TweetData, User } from '@embetty/types'
import { observable, webcomponent } from '../decorators'
import { Embed } from '../embed'
import { height, parseHostname } from '../util'

const CSS =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
  require('!css-loader!postcss-loader!sass-loader!./tweet.scss').default.toString() as string

const HEIGHT_OFFSET = 2

const template = `
    <style>${CSS}</style>
      <header>
        <img src="{{profileImageUrl}}" />
        <span>
          <strong>{{userName}}</strong>
          <a href="https://twitter.com/{{screenName}}" target="_blank" rel="noopener" >@{{screenName}}</a>
        </span>
      </header>
      <article>
        <p>{{{ fullText }}}</p>
        {{#hasImages}}
          <section class="media-{{images.length}}" id="media">
            {{#images}}
              <a target="_blank" href="{{imageUrl}}"><img src="{{imageUrl}}"></a>
            {{/images}}
          </section>
        {{/hasImages}}
        {{#hasAdditionalMedia}}
          <section class="media-hint">
            <a href="{{twitterUrl}}" target="_blank" rel="noopener">
              Weitere Inhalte des Posts auf x.com
            </a>
          </section>
        {{/hasAdditionalMedia}}

        {{#hasLinks}}
          <a href="{{link.url}}" target="_blank" rel="noopener" id="links">
            <img src="{{linkImageUrl}}">
            <section id="link-body">
              <h3>{{link.title}}</h3>
              {{#link.description}}<p>{{link.description}}</p>{{/link.description}}
              <span>{{linkHostname}}</span>
            </section>
          </a>
        {{/hasLinks}}

        <a href="{{twitterUrl}}" target="_blank" rel="noopener" id="created-at" class="tweet__link">
          <time datetime="{{createdAt.toISOString}}">{{createdAt.toLocaleString}}</time>
          via X (Twitter)
          <svg id="xcorp-icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 22.1 20" preserveAspectRatio="xMinYMin" style="height: 12px"><path id="path2" d="M17.4,0h3.4l-7.4,8.5L22.1,20h-6.8L10,13l-6.1,7H0.4l7.9-9.1L0,0h7l4.8,6.4L17.4,0z M16.2,18h1.9L6,1.9H4 L16.2,18z"/></svg>
        </a>

        <a href="https://www.heise.de/embetty?wt_mc=link.embetty.poweredby" target="_blank" rel="noopener" id="powered-by" title="embetty - displaying remote content without compromising your privacy.">
          powered by {{{embettyLogo}}}</a>
      </article>
    `

@webcomponent('embetty-tweet', template)
@observable()
export class Tweet extends Embed<EmbettyTweet> {
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
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

  get fullText() {
    const text = this._data?.data.note_tweet
      ? this._data?.data.note_tweet.text
      : this._data?.data.text

    return (text ?? '')
      .replaceAll(/#([^\s-]+)/g, (hashTag: string, word: string) => {
        return `<a href="https://twitter.com/hashtag/${word}">${hashTag}</a>`
      })
      .replaceAll(/@(\w+)/g, (name: string, word: string) => {
        return `<a href="https://twitter.com/${word}">${name}</a>`
      })
    // .replace(/(https:\/\/\S+)$/, (link: string) => {
    //   if (this.hasMedia && this.media[0].url === link) {
    //     return ''
    //   }
    //   return link
    // })
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
