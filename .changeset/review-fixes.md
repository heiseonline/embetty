---
'@embetty/base': patch
'@embetty/server': patch
---

- Link previews of tweets work again for large pages: web pages are read up to 1 MiB instead of being rejected beyond it.
- Malformed responses from upstream services (invalid JSON, unexpected shapes, API errors) answer 502 with a one-line log instead of 500 with a stack trace.
- An invalid `EMBETTY_CACHE_TTL` (not a positive whole number of seconds) fails at startup.
