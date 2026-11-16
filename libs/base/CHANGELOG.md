# @embetty/base

## 3.1.0

### Minor Changes

- 5bdd992: New `EMBETTY_TRUSTED_HOSTS`: hostnames that may resolve to private or internal addresses. Behind split DNS, links to your own sites (e.g. `www.heise.de` in a tweet) resolve internally, and the SSRF protection dropped their link previews. Exact names only; every other host and every redirect hop is still checked as before. `createGuardedFetch()` takes the same list as `trustedHosts`.

## 3.0.0

### Major Changes

- e955bba: Packages are built with Bun instead of tsc and webpack.
  
  - `@embetty/base` and `@embetty/types` ship one bundled CommonJS file plus declarations and declare `exports`; deep imports such as `@embetty/base/src/...` no longer work.
  - `@embetty/component` ships a minified IIFE bundle (`dist/embetty.js`) that targets current browsers; it no longer declares `engines`.
  - `@embetty/server`: `npm start` runs `dist/server.js` (the referenced `bin/www` did not exist), and `dotenv` is no longer a dependency; set environment variables directly.
- 8f9b999: axios is no longer a dependency. `Embetty` takes a `GuardedFetch` (from `createGuardedFetch()`) instead of an axios instance, request options are `{ url, params, headers, timeout, responseType }`, and cached response headers are a plain object with lower-cased names. `Embetty` and `EmbedOptions` lost their unused type parameter. Unsuccessful responses reject with `HttpStatusError`.
- 24ce433: Require Node.js 24 or later. The Docker image now runs on the current LTS release, Node.js 26.

### Minor Changes

- a8b7f51: Restrict outgoing requests to public http(s) targets, bound their duration and size, and serve only raster images (JPEG, PNG, GIF, WebP, AVIF) from image routes. Mastodon instances can be restricted via `MASTODON_INSTANCES`.
  
  Outgoing requests no longer honor `HTTP_PROXY`/`HTTPS_PROXY`, because a proxy would bypass the address checks. Cache keys changed, so existing cache entries are no longer used.

### Patch Changes

- 62de8f3: Declare `@embetty/types` as a dependency. The published type declarations import it, so TypeScript consumers could not resolve them.
- ff1a5f9: Dependencies updated: cheerio 1.2, ioredis 6, lru-cache 11, helmet 8. ioredis 6 talks RESP3 to Redis, which requires Redis 6 or later.
- 60c0bfa: - `@embetty/base`: the LRU cache now honors `max` from `EMBETTY_CACHE` (e.g. `lru://max:500`); it was always 100 before. `TwitterErrorType` is a plain object instead of a TypeScript enum.
  - `@embetty/types`: Mastodon fields typed as `any` now have their actual types, including `null` where the API returns it.
  - `@embetty/component`: errors while loading an embed are logged instead of surfacing as unhandled rejections.
- d9d56dc: update to Node.js 24 and update vulnerable dependencies (axios, express, morgan)
- ea3943f: - Link previews of tweets work again for large pages: web pages are read up to 1 MiB instead of being rejected beyond it.
  - Malformed responses from upstream services (invalid JSON, unexpected shapes, API errors) answer 502 with a one-line log instead of 500 with a stack trace.
  - An invalid `EMBETTY_CACHE_TTL` (not a positive whole number of seconds) fails at startup.
- 5e3360b: Hardening against abuse through attacker-controlled upstreams:
  
  - The in-memory cache is bounded by size (`maxSize`, default 64 MiB) besides the number of entries, and cached responses expire after `EMBETTY_CACHE_TTL` seconds (default one day), in Redis as well.
  - JSON and text responses are limited to 1 MiB, images stay at 10 MiB.
  - Cache keys include the response type and query, so a URL requested as an image cannot replace the cached JSON of the same URL. Existing cache entries are no longer used.
  - Upstream failures (timeouts, oversized or non-image responses, unreachable or erroring services) answer 502 or 504 and are logged in one line instead of 500 with a stack trace.
  - Debug logs no longer contain request headers, which included the Twitter bearer token.
  - Facebook videos no longer request the Facebook page, whose content was never used.
- 38aa062: - `commander`, `cors`, `http-status` and `content-type` are no longer dependencies.
  - The `embetty` and `embetty start` CLI options work again: with commander 10 they were silently ignored. The documented cache default is now the actual one (`lru://`).
  - CORS preflights answer `GET, HEAD` as allowed methods, the only ones the server serves.
- 9e504b1: Deleted or unknown tweets are recognized again since the Twitter API reports them under `api.x.com`; the server answers 404 instead of 500. `TwitterErrorType` is no longer exported.
- Updated dependencies [e955bba]
- Updated dependencies [60c0bfa]
  - @embetty/types@3.0.0

## 2.1.3

### Patch Changes

- fd3b8e3: fixes runtime error where the app tries to access an undefined entities property
- 3a87762: added media hint and full tweets are now displayed

## 2.1.2

### Patch Changes

- c997c8a: adds reply count, repost count and favourite count to mastodon post

## 2.1.1

### Patch Changes

- 5275b34: fix published files

## 2.1.0

### Minor Changes

- 6b6b6c1: This version adds support for mastodon statuses via embetty-mastodon

### Patch Changes

- f71aa16: Fixed runtime issues

## 2.0.2

### Patch Changes

- e84df2e: Properly use EMBETTY_CACHE env var

## 2.0.1

### Patch Changes

- c18a469: fix embetty-server cli

## 2.0.0

### Major Changes

- d3548b9: Configured embetty mono-repo and migrated embetty-tweet to Twitter API V2
