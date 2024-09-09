import { UrlMeta } from '.'

export interface EmbettyTweet extends TweetData {
  linkMetas: UrlMeta[]
}

export type TweetResponse = TweetData | ErrorResponse

export interface TweetData {
  data: Data
  includes: Includes
}

export interface ErrorResponse {
  errors: TwitterError[]
}

export interface TwitterError {
  value: string
  detail: string
  title: string
  resource_type: 'tweet' | unknown
  parameter: string
  resource_id: string
  type: string
}

export interface Data {
  public_metrics: PublicMetrics
  created_at: string
  entities?: Entities
  id: string
  edit_history_tweet_ids: string[]
  reply_settings: string
  possibly_sensitive: boolean
  edit_controls: EditControls
  note_tweet?: NoteTweet
  conversation_id: string
  lang: string
  author_id: string
  text: string
  context_annotations: ContextAnnotation[]
  attachments?: Attachments
  referenced_tweets?: ReferencedTweet[]
}

export interface NoteTweet {
  text: string
}

export interface ReferencedTweet {
  type: 'replied_to' | unknown
  id: string
}

export interface Attachments {
  media_keys: string[]
}

export interface PublicMetrics {
  retweet_count: number
  reply_count: number
  like_count: number
  quote_count: number
  impression_count: number
}

export interface Entities {
  hashtags: Hashtag[]
  urls: Url[]
}

export interface Hashtag {
  start: number
  end: number
  tag: string
}

export interface Url {
  start: number
  end: number
  url: string
  expanded_url: string
  display_url: string
  images: Image[]
  status: number
  title: string
  description: string
  unwound_url: string
}

export interface Image {
  url: string
  width: number
  height: number
}

export interface EditControls {
  edits_remaining: number
  is_edit_eligible: boolean
  editable_until: string
}

export interface ContextAnnotation {
  domain: Domain
  entity: Entity
}

export interface Domain {
  id: string
  name: string
  description: string
}

export interface Entity {
  id: string
  name: string
}

export interface Includes {
  users: User[]
  tweets: Tweet[]
  media: Media[]
}

export interface Media {
  width: number
  height: number
  type: 'photo'
  media_key: string
  url?: string
  preview_image_url: string
}

export interface User {
  profile_image_url: string
  username: string
  name: string
  id: string
}

export interface Tweet {
  public_metrics: PublicMetrics2
  created_at: string
  entities: Entities2
  id: string
  edit_history_tweet_ids: string[]
  reply_settings: string
  possibly_sensitive: boolean
  edit_controls: EditControls2
  conversation_id: string
  lang: string
  author_id: string
  text: string
  context_annotations: ContextAnnotation2[]
}

export interface PublicMetrics2 {
  retweet_count: number
  reply_count: number
  like_count: number
  quote_count: number
  impression_count: number
}

export interface Entities2 {
  hashtags: Hashtag2[]
  urls: Url2[]
}

export interface Hashtag2 {
  start: number
  end: number
  tag: string
}

export interface Url2 {
  start: number
  end: number
  url: string
  expanded_url: string
  display_url: string
  images: Image2[]
  status: number
  title: string
  description: string
  unwound_url: string
}

export interface Image2 {
  url: string
  width: number
  height: number
}

export interface EditControls2 {
  edits_remaining: number
  is_edit_eligible: boolean
  editable_until: string
}

export interface ContextAnnotation2 {
  domain: Domain2
  entity: Entity2
}

export interface Domain2 {
  id: string
  name: string
  description: string
}

export interface Entity2 {
  id: string
  name: string
}
