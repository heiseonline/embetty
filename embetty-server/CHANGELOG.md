# Changelog

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
