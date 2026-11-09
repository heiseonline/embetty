---
'@embetty/base': minor
'@embetty/server': minor
---

Restrict outgoing requests to public http(s) targets, bound their duration and size, and serve only raster images (JPEG, PNG, GIF, WebP, AVIF) from image routes. Mastodon instances can be restricted via `MASTODON_INSTANCES`.

Outgoing requests no longer honor `HTTP_PROXY`/`HTTPS_PROXY`, because a proxy would bypass the address checks. Cache keys changed, so existing cache entries are no longer used.
