---
'@embetty/component': patch
---

Embedded content can no longer inject script into the embedding page:

- Mastodon status HTML is sanitized before rendering. Statuses may come from any Mastodon-compatible server, which can return arbitrary HTML.
- Tweet text is escaped; quotes in hashtags or mentions could break out of the generated links.
- Profile, card and link URLs are only rendered as links if they use http or https.
