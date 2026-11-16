---
'@embetty/component': patch
'@embetty/server': patch
---

- `@embetty/component`: `<embetty-video>` no longer throws when created via `document.createElement()` or before its `type` attribute is set; the video implementation is resolved on first use.
- `@embetty/server`: video and Mastodon routes answer 404 instead of 500 when the upstream service does not know the requested ID.
