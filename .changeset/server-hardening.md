---
'@embetty/base': patch
'@embetty/server': patch
---

Hardening against abuse through attacker-controlled upstreams:

- The in-memory cache is bounded by size (`maxSize`, default 64 MiB) besides the number of entries, and cached responses expire after `EMBETTY_CACHE_TTL` seconds (default one day), in Redis as well.
- JSON and text responses are limited to 1 MiB, images stay at 10 MiB.
- Cache keys include the response type and query, so a URL requested as an image cannot replace the cached JSON of the same URL. Existing cache entries are no longer used.
- Upstream failures (timeouts, oversized or non-image responses, unreachable or erroring services) answer 502 or 504 and are logged in one line instead of 500 with a stack trace.
- Debug logs no longer contain request headers, which included the Twitter bearer token.
- Facebook videos no longer request the Facebook page, whose content was never used.
