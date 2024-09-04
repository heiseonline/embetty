import type {
  EmbettyTweet,
  TweetData,
  TweetResponse,
  UrlMeta,
} from '@embetty/types'
import { load } from 'cheerio'
import debug_ from 'debug'
import { CacheEntry } from '../cache/cache'
import { Embed, EmbedOptions, EmbettyRequest } from '../embed'
import { env } from '../util'
import { TwitterApiException } from './twitter-api-exception'

const debug = debug_('embetty-base:tweet')

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export class Tweet extends Embed<TweetResponse, EmbettyTweet> {
  urls: string[] = []
  linkMetas: UrlMeta[] = []

  constructor(id: string, options: EmbedOptions<TweetResponse>) {
    if (Number.isInteger(id)) {
      throw new TypeError('Invalid Tweet ID')
    }

    super(id, options)
  }

  assertTweetData(data: TweetResponse | undefined): asserts data is TweetData {
    const error = data !== undefined && !('data' in data) && data.errors?.[0]

    if (error) {
      throw new TwitterApiException(error)
    }
  }

  get tweetData(): TweetData {
    const data = this.data

    this.assertTweetData(data)

    return data
  }

  get _requestOptions(): EmbettyRequest {
    return {
      // url: `https://api.twitter.com/1.1/statuses/show/${this.id}.json`,
      // url: `https://api.twitter.com/2/tweets?ids=${this.id}`,
      url: `https://api.twitter.com/2/tweets/${this.id}`,

      params: {
        // tweet_mode: 'extended',
        'tweet.fields':
          'attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld,edit_history_tweet_ids,edit_controls,note_tweet',
        expansions:
          'attachments.poll_ids,attachments.media_keys,author_id,geo.place_id,in_reply_to_user_id,referenced_tweets.id,entities.mentions.username,referenced_tweets.id.author_id,edit_history_tweet_ids',
        'user.fields': 'id,name,username,profile_image_url',
        'media.fields':
          'duration_ms,height,media_key,non_public_metrics,organic_metrics,preview_image_url,promoted_metrics,public_metrics,type,url,width',
      },
      headers: {
        Authorization: `Bearer ${env('TWITTER_BEARER_TOKEN')}`,
      },
    } satisfies EmbettyRequest
  }

  get type() {
    return 'tweet'
  }

  get rateLimitRemaining() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return parseInt(this._response?.headers['x-rate-limit-remaining'], 10)
  }

  get rateLimitReset() {
    const reset =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-magic-numbers
      parseInt(this._response?.headers['x-rate-limit-reset'], 10) * 1000
    return new Date(reset)
  }

  get hasLinks() {
    return this.links.length > 0
  }

  get links() {
    return this.tweetData?.data.entities?.urls ?? []
  }

  get profileImageUrl() {
    return this.tweetData?.includes.users[0]?.profile_image_url.replace(
      '_normal',
      '_bigger',
    )
  }

  getProfileImage() {
    const url = this.profileImageUrl
    return url ? this.embetty.getBinary({ url }) : undefined
  }

  get media() {
    return (this.tweetData?.data.attachments?.media_keys ?? [])
      .map((key) =>
        this.tweetData?.includes.media.find(
          (media) => media.media_key === key && media.type === 'photo',
        ),
      )
      .filter(isDefined)
  }

  async getImageUrl(index = 0) {
    await this.retrieve()

    return this.media[index]?.url ?? this.media[index]?.preview_image_url
  }

  async getImage(idx = 0) {
    const imageUrl = await this.getImageUrl(idx)

    return imageUrl ? this.embetty.getBinary({ url: imageUrl }) : undefined
  }

  async _retrieveMeta(url: string): Promise<UrlMeta | undefined> {
    if (this.referencedTweetMeta) {
      return this.referencedTweetMeta
    }

    let response: CacheEntry<string> | undefined

    try {
      response = await this.embetty.get<string>({ url })
    } catch (error_) {
      const error =
        error_ instanceof Error ? error_ : new Error(JSON.stringify(error_))
      console.error(`error in retrieving meta: ${error.name}: ${error.message}`)
      return undefined
    }

    if (!response?.data) {
      return undefined
    }

    const $ = load(response.data, {})

    return {
      url,
      description: $('meta[name=description]').attr('content'),
      image: $('meta[property="og:image"]').attr('content'),
      title: $('meta[property="og:title"]').attr('content'),
    }
  }

  async getLinkImageUrl(): Promise<string | undefined> {
    const url = this.tweetData.data.entities?.urls[0]?.expanded_url

    if (!url) {
      return undefined
    }

    const meta = await this._retrieveMeta(url)

    return meta?.image
  }

  async getLinkImage() {
    const url = await this.getLinkImageUrl()

    if (!url) {
      return undefined
    }

    return this.embetty.getBinary({ url })
  }

  get referencedTweet() {
    return this.tweetData.data?.referenced_tweets?.find(
      (t) => t.type === 'quoted',
    )
  }

  get referencedTweetMeta() {
    const referencedTweet = this.referencedTweet

    if (!referencedTweet) {
      return undefined
    }

    const includedTweet = this.tweetData.includes.tweets.find(
      (t) => t.id === referencedTweet.id,
    )

    const authorId = includedTweet?.author_id

    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      url: this.tweetData.data.entities?.urls[0]?.expanded_url!,
      description: includedTweet?.text,
      image: this.tweetData.includes.users
        .find((u) => u.id === authorId)
        ?.profile_image_url.replace('_normal', '_bigger'),
    }
  }

  async _retrieveMetas() {
    this.linkMetas = this.referencedTweetMeta
      ? [this.referencedTweetMeta]
      : (
          await Promise.all(
            this.links.map((link) =>
              this._retrieveMeta(link.expanded_url || link.url),
            ),
          )
        ).filter(isDefined)
  }

  override async retrieve() {
    await super.retrieve()

    if (this.hasLinks) {
      debug('Retrieving link meta ...')
      await this._retrieveMetas()
    }
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      linkMetas: this.linkMetas,
    }
  }
}
