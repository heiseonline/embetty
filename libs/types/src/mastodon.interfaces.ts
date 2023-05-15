export interface EmbettyMastodonPost {
  id: string
  created_at: string
  url: string
  media_attachments: any[]
  content: string
}

export type MastodonStatusResponse = MastodonStatusData | MastodonErrorResponse

export interface MastodonErrorResponse {
  error: string
}
export interface MastodonStatusData {
  id: string
  created_at: string
  in_reply_to_id: any
  in_reply_to_account_id: any
  sensitive: boolean
  spoiler_text: string
  visibility: string
  language: string
  uri: string
  url: string
  replies_count: number
  reblogs_count: number
  favourites_count: number
  edited_at: any
  content: string
  reblog: any
  application: MastodonResponseApplication
  account: MastodonResponseAccount
  media_attachments: MastodonMediaAttachment[]
  mentions: any[]
  tags: any[]
  emojis: any[]
  card: MastodonResponseCard
  poll: Poll
}

export interface MastodonMediaAttachment {
  id: string
  type: string
  url: string
  preview_url: string
  remote_url: any
  preview_remote_url: any
  text_url: any
  meta: MastodonMedia
  description: any
  blurhash: string
}

export interface MastodonMedia {
  original: MastodonMediaOriginal
  small: MastodonMediaSmall
}

export interface MastodonMediaOriginal {
  width: number
  height: number
  size: string
  aspect: number
}

export interface MastodonMediaSmall {
  width: number
  height: number
  size: string
  aspect: number
}

export interface MastodonResponseApplication {
  name: string
  website: any
}

export interface MastodonResponseAccount {
  id: string
  username: string
  acct: string
  display_name: string
  locked: boolean
  bot: boolean
  discoverable: boolean
  group: boolean
  created_at: string
  note: string
  url: string
  avatar: string
  avatar_static: string
  header: string
  header_static: string
  followers_count: number
  following_count: number
  statuses_count: number
  last_status_at: string
  noindex: boolean
  emojis: any[]
  roles: any[]
  fields: MastodonResponseField[]
}

export interface MastodonResponseField {
  name: string
  value: string
  verified_at: string
}

export interface MastodonResponseCard {
  url: string
  title: string
  description: string
  type: string
  author_name: string
  author_url: string
  provider_name: string
  provider_url: string
  html: string
  width: number
  height: number
  image: string
  embed_url: string
  blurhash: string
}

export interface Poll {
  id: string
  expires_at: string
  expired: boolean
  multiple: boolean
  votes_count: number
  voters_count: number
  options: MastodonResponseOption[]
  emojis: any[]
}

export interface MastodonResponseOption {
  title: string
  votes_count: number
}
