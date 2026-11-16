---
'@embetty/base': minor
'@embetty/server': minor
---

New `EMBETTY_TRUSTED_HOSTS`: hostnames that may resolve to private or internal addresses. Behind split DNS, links to your own sites (e.g. `www.heise.de` in a tweet) resolve internally, and the SSRF protection dropped their link previews. Exact names only; every other host and every redirect hop is still checked as before. `createGuardedFetch()` takes the same list as `trustedHosts`.
