# Changelog

## 4.0.0

### Major Changes

- d43018f: - AMP pages are rendered without nunjucks.
  - AMP video pages pass only the `start-at`, `poster-image`, `width` and `height` query parameters on to `<embetty-video>`. Before, every query parameter became an attribute, including event handlers such as `onmouseover`.
  - A `URL_BASE` with a path (e.g. `https://example.com/embetty`) no longer loses its last path segment in AMP pages.
- e955bba: Packages are built with Bun instead of tsc and webpack.
  
  - `@embetty/base` and `@embetty/types` ship one bundled CommonJS file plus declarations and declare `exports`; deep imports such as `@embetty/base/src/...` no longer work.
  - `@embetty/component` ships a minified IIFE bundle (`dist/embetty.js`) that targets current browsers; it no longer declares `engines`.
  - `@embetty/server`: `npm start` runs `dist/server.js` (the referenced `bin/www` did not exist), and `dotenv` is no longer a dependency; set environment variables directly.
- 24ce433: Require Node.js 24 or later. The Docker image now runs on the current LTS release, Node.js 26.

### Minor Changes

- a8b7f51: Restrict outgoing requests to public http(s) targets, bound their duration and size, and serve only raster images (JPEG, PNG, GIF, WebP, AVIF) from image routes. Mastodon instances can be restricted via `MASTODON_INSTANCES`.
  
  Outgoing requests no longer honor `HTTP_PROXY`/`HTTPS_PROXY`, because a proxy would bypass the address checks. Cache keys changed, so existing cache entries are no longer used.

### Patch Changes

- e955bba: - `@embetty/component`: `<embetty-video>` no longer throws when created via `document.createElement()` or before its `type` attribute is set; the video implementation is resolved on first use.
  - `@embetty/server`: video and Mastodon routes answer 404 instead of 500 when the upstream service does not know the requested ID.
- 0dfad29: The Docker image is now based on Debian (`node:26-trixie-slim`) instead of Alpine and runs as the `node` user.
- ff1a5f9: Dependencies updated: cheerio 1.2, ioredis 6, lru-cache 11, helmet 8. ioredis 6 talks RESP3 to Redis, which requires Redis 6 or later.
- 6f97fcf: The server runs on Express 5.
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
- 9843886: - Mastodon image routes answer 404 when the status has no such image (e.g. no link preview) instead of 400.
  - The Docker image contains only the built packages and their runtime dependencies, no sources or local files from the build context.
- 38aa062: - `commander`, `cors`, `http-status` and `content-type` are no longer dependencies.
  - The `embetty` and `embetty start` CLI options work again: with commander 10 they were silently ignored. The documented cache default is now the actual one (`lru://`).
  - CORS preflights answer `GET, HEAD` as allowed methods, the only ones the server serves.
- 9e504b1: Deleted or unknown tweets are recognized again since the Twitter API reports them under `api.x.com`; the server answers 404 instead of 500. `TwitterErrorType` is no longer exported.
- Updated dependencies [62de8f3]
- Updated dependencies [e955bba]
- Updated dependencies [e955bba]
- Updated dependencies [2f02e22]
- Updated dependencies [c03ec39]
- Updated dependencies [e0f6fc3]
- Updated dependencies [ff1a5f9]
- Updated dependencies [a8b7f51]
- Updated dependencies [8f9b999]
- Updated dependencies [60c0bfa]
- Updated dependencies [24ce433]
- Updated dependencies [d9d56dc]
- Updated dependencies [ea3943f]
- Updated dependencies [5e3360b]
- Updated dependencies [38aa062]
- Updated dependencies [9e504b1]
  - @embetty/base@3.0.0
  - @embetty/component@3.0.0

## 3.2.12

### Patch Changes

- 2b69884: Mention embetty server version on bootstrap'

## 3.2.7-3.2.11

Fixed docker CI setup

## 3.2.6

### Patch Changes

- b5af2d5: upgraded deps

## 3.2.5

### Patch Changes

- 3a87762: added media hint and full tweets are now displayed
- Updated dependencies [fd3b8e3]
- Updated dependencies [3a87762]
  - @embetty/base@2.1.3
  - @embetty/component@2.4.0

## 3.2.4

### Patch Changes

- Updated dependencies [11c7406]
  - @embetty/component@2.3.1

## 3.2.3

### Patch Changes

- Updated dependencies [f162d56]
  - @embetty/component@2.3.0

## 3.2.2

### Patch Changes

- c997c8a: adds reply count, repost count and favourite count to mastodon post
- Updated dependencies [c997c8a]
  - @embetty/component@2.2.0
  - @embetty/base@2.1.2

## 3.2.1

### Patch Changes

- 0c4a28a: Fixed docker image to include the views folder

## 3.2.0

### Minor Changes

- 47dc31a: Added support for mastodon AMP routing

### Patch Changes

- 569948d: embetty-server now fixes URL paths where `//` have been replaced by `/` from the schema component by nginx.
- Updated dependencies [15cbba7]
  - @embetty/component@2.1.2

## 3.1.1

### Patch Changes

- 5275b34: fix published files
- Updated dependencies [5275b34]
  - @embetty/component@2.1.1
  - @embetty/base@2.1.1

## 3.1.0

### Minor Changes

- 6b6b6c1: This version adds support for mastodon statuses via embetty-mastodon

### Patch Changes

- f71aa16: Fixed runtime issues
- Updated dependencies [6b6b6c1]
- Updated dependencies [f71aa16]
  - @embetty/component@2.1.0
  - @embetty/base@2.1.0

## 3.0.3

### Patch Changes

- 5000352: disable resource/opener policies

## 3.0.2

### Patch Changes

- 1607a91: Disabled Cross-Origin-Embedder-Policy

## 3.0.1

### Patch Changes

- Updated dependencies [e84df2e]
  - @embetty/base@2.0.2

## 3.0.0

### Major Changes

- 4dc7b4f: Release heiseonline/embetty-server v3 docker image

## 2.0.1

### Patch Changes

- c18a469: fix embetty-server cli
- Updated dependencies [c18a469]
  - @embetty/base@2.0.1
  - @embetty/component@2.0.1

## 2.0.0

### Major Changes

- d3548b9: Configured embetty mono-repo and migrated embetty-tweet to Twitter API V2

### Patch Changes

- 683cd44: Fixed dependencies
- Updated dependencies [d3548b9]
  - @embetty/base@2.0.0
  - @embetty/component@2.0.0

## v2.0.3, 2020-02-25

- Fixed Dockerfile issues.

## v2.0.2, 2020-02-24

- Fixed CI issues.

## v2.0.1, 2020-02-24

- Fixed broken AMP routes by upgrading `@heise/embetty` to `3.0.2`.

## v2.0.0, 2020-02-24

This release contains breaking changes:

- Dropped support for Node.js v8.
- Removed support for Facebook poster images.

## v1.2.5-7, 2019-09-05

- Chore: fix travis and docker deployment

## v1.2.4, 2019-09-05

- Upgrade embetty-base, fix cloudflare error

## v1.2.3, 2019-06-11

- Upgraded dependencies.

## v1.2.2, 2018-10-25

- Upgraded dependencies.
- Improved tests to support Node versions 8 and 10.

## v1.2.1, 2018-08-31

- Fixed docker build by downgrading `eslint` dependency to `4.19.1`.

## v1.2.0, 2018-08-31

- Added support for custom 'start at' attributes for YouTube and Vimeo.
- Fixed URL generation.
- Improved docs.
- Upgraded dependencies.

## v1.1.2, 2018-06-12

- Fixed the Embetty AMP ⚡️ integration.

## v1.1.1, 2018-06-12

- Fixed `embetty.js` script path in the AMP ⚡️ iframe.

## v1.1.0, 2018-06-12

- Added support for [AMP ⚡️](https://www.ampproject.org/) via `<amp-iframe>`.
- Upgraded dependencies.

## v1.0.0, 2018-05-28

- Fixed API so Youtube videos can now contain minus signs.

## v1.0.0-beta.6, 2018-04-24

- Upgraded dependencies.

## v1.0.0-beta.5, 2018-04-16

- Added `embetty` as global bin.
- Upgraded dependencies.

## v1.0.0-beta.4, 2018-02-26

- Disabled the `Strict-Transport-Security` response header.
- Upgraded dependencies.
- Upgraded `@heise/embetty-base` to `^1.0.0-beta.5`.

## v1.0.0-beta.3, 2018-01-30

- Added `GET /version` route.
- Bumped `debug` to `^3.1.0`.
- Bumped `mocha` to `5.0.0`.
- Upgraded dependencies.

## v1.0.0-beta.2, 2018-01-18

- Fixed dependencies.

## v1.0.0-beta, 2018-01-18

- Initial release
