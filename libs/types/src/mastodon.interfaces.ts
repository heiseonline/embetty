export interface EmbettyMastodonPost {
  id: string
  created_at: string
  url: string
  media_attachments: MastodonMediaAttachment[]
  content: string
}

export type MastodonStatusResponse = MastodonStatusData | MastodonErrorResponse

export interface MastodonErrorResponse {
  error: string
}
export interface MastodonStatusData {
  id: string
  created_at: string
  in_reply_to_id: string | null
  in_reply_to_account_id: string | null
  sensitive: boolean
  spoiler_text: string
  visibility: string
  language: string
  uri: string
  url: string
  replies_count: number
  reblogs_count: number
  favourites_count: number
  edited_at: string | null
  content: string
  reblog: MastodonStatusData | null
  application: MastodonResponseApplication
  account: MastodonResponseAccount
  media_attachments: MastodonMediaAttachment[]
  mentions: MastodonMention[]
  tags: MastodonTag[]
  emojis: MastodonCustomEmoji[]
  card: MastodonResponseCard | null
  poll: Poll | null
}

export interface MastodonMediaAttachment {
  id: string
  type: string
  url: string
  preview_url: string
  remote_url: string | null
  preview_remote_url: string | null
  text_url: string | null
  meta: MastodonMedia
  description: string | null
  blurhash: string | null
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
  website: string | null
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
  emojis: MastodonCustomEmoji[]
  roles: MastodonAccountRole[]
  fields: MastodonResponseField[]
}

export interface MastodonResponseField {
  name: string
  value: string
  verified_at: string | null
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
  image: string | null
  embed_url: string
  blurhash: string | null
}

export interface Poll {
  id: string
  expires_at: string
  expired: boolean
  multiple: boolean
  votes_count: number
  voters_count: number
  options: MastodonResponseOption[]
  emojis: MastodonCustomEmoji[]
}

export interface MastodonResponseOption {
  title: string
  votes_count: number
}

export interface MastodonMention {
  id: string
  username: string
  url: string
  acct: string
}

export interface MastodonTag {
  name: string
  url: string
}

export interface MastodonCustomEmoji {
  shortcode: string
  url: string
  static_url: string
  visible_in_picker: boolean
  category?: string
}

export interface MastodonAccountRole {
  id: string
  name: string
  color: string
}
