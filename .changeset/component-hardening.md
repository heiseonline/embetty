---
'@embetty/component': patch
---

- `video-id` must be a valid YouTube, Vimeo or Facebook ID and `start-at` a number of seconds; both used to be inserted into the player markup unescaped.
- The `status` attribute of `<embetty-mastodon>` only becomes a link if it is an http(s) URL.
- Links in Mastodon statuses that open a new tab always get `noopener noreferrer`; other `rel` values are limited to a safe set. SVG and MathML inside a status are dropped.
- Reply threads stop after ten tweets or at a tweet that is already part of the thread.
