# [4.0.0](https://github.com/heiseonline/embetty/compare/v3.0.8...v4.0.0) (2023-03-08)

## 3.0.0

### Major Changes

- e955bba: Packages are built with Bun instead of tsc and webpack.
  
  - `@embetty/base` and `@embetty/types` ship one bundled CommonJS file plus declarations and declare `exports`; deep imports such as `@embetty/base/src/...` no longer work.
  - `@embetty/component` ships a minified IIFE bundle (`dist/embetty.js`) that targets current browsers; it no longer declares `engines`.
  - `@embetty/server`: `npm start` runs `dist/server.js` (the referenced `bin/www` did not exist), and `dotenv` is no longer a dependency; set environment variables directly.

### Patch Changes

- e955bba: - `@embetty/component`: `<embetty-video>` no longer throws when created via `document.createElement()` or before its `type` attribute is set; the video implementation is resolved on first use.
  - `@embetty/server`: video and Mastodon routes answer 404 instead of 500 when the upstream service does not know the requested ID.
- 2f02e22: - `video-id` must be a valid YouTube, Vimeo or Facebook ID and `start-at` a number of seconds; both used to be inserted into the player markup unescaped.
  - The `status` attribute of `<embetty-mastodon>` only becomes a link if it is an http(s) URL.
  - Links in Mastodon statuses that open a new tab always get `noopener noreferrer`; other `rel` values are limited to a safe set. SVG and MathML inside a status are dropped.
  - Reply threads stop after ten tweets or at a tweet that is already part of the thread.
- c03ec39: When the Embetty server answers with an error (e.g. 404 for a deleted tweet), the component logs an `EmbedLoadError` naming the URL and status instead of a JSON parse error.
- e0f6fc3: Embedded content can no longer inject script into the embedding page:
  
  - Mastodon status HTML is sanitized before rendering. Statuses may come from any Mastodon-compatible server, which can return arbitrary HTML.
  - Tweet text is escaped; quotes in hashtags or mentions could break out of the generated links.
  - Profile, card and link URLs are only rendered as links if they use http or https.
- 60c0bfa: - `@embetty/base`: the LRU cache now honors `max` from `EMBETTY_CACHE` (e.g. `lru://max:500`); it was always 100 before. `TwitterErrorType` is a plain object instead of a TypeScript enum.
  - `@embetty/types`: Mastodon fields typed as `any` now have their actual types, including `null` where the API returns it.
  - `@embetty/component`: errors while loading an embed are logged instead of surfacing as unhandled rejections.

## 2.4.0

### Minor Changes

- 3a87762: added media hint and full tweets are now displayed

## 2.3.1

### Patch Changes

- 11c7406: feat: update twitter branding to x branding

## 2.3.0

### Minor Changes

- f162d56: link-color can be configured via variable

## 2.2.0

### Minor Changes

- c997c8a: adds reply count, repost count and favourite count to mastodon post

## 2.1.2

### Patch Changes

- 15cbba7: Fixed mastodon embed to properly compute the api url

## 2.1.1

### Patch Changes

- 5275b34: fix published files

## 2.1.0

### Minor Changes

- 6b6b6c1: This version adds support for mastodon statuses via embetty-mastodon

### Patch Changes

- f71aa16: Fixed runtime issues

## 2.0.1

### Patch Changes

- c18a469: fix embetty-server cli

## 2.0.0

### Major Changes

- d3548b9: Configured embetty mono-repo and migrated embetty-tweet to Twitter API V2

### Bug Fixes

- update build target to es6 and remove some polyfills ([fd55092](https://github.com/heiseonline/embetty/commit/fd550929143f10a8e4b467657eeff119a0374943))

### BREAKING CHANGES

- requires es6 support from browsers

## [3.0.8](https://github.com/heiseonline/embetty/compare/v3.0.7...v3.0.8) (2021-10-22)

### Bug Fixes

- node-sass durch dart-sass (sass) ersetzen ([e87bba7](https://github.com/heiseonline/embetty/commit/e87bba792ea6ced8bc6175f68f76638bc0814d24))

## [3.0.7](https://github.com/heiseonline/embetty/compare/v3.0.6...v3.0.7) (2021-05-16)

### Bug Fixes

- **CSS:** optimize for recommended browserlist ([05eeacd](https://github.com/heiseonline/embetty/commit/05eeacdec32f1da4e81ff6528dcfb31259ed377e))

## [3.0.6](https://github.com/heiseonline/embetty/compare/v3.0.5...v3.0.6) (2021-05-16)

### Bug Fixes

- include correct Embetty version in build artifacts ([90e3d26](https://github.com/heiseonline/embetty/commit/90e3d266880bddd01527756d7f5f8478f45c64b5))

## [3.0.5](https://github.com/heiseonline/embetty/compare/v3.0.4...v3.0.5) (2021-05-16)

### Bug Fixes

- fix broken Github release upload ([e816e26](https://github.com/heiseonline/embetty/commit/e816e2622167de3dbc5e4eb6ef8e36c626e8e43a))

## [3.0.4](https://github.com/heiseonline/embetty/compare/v3.0.3...v3.0.4) (2021-05-16)

### Bug Fixes

- define custom element directly if web components already loaded ([b64f7fa](https://github.com/heiseonline/embetty/commit/b64f7fa61d64b298256b67548eea93aae5d4eba1))
- only define custom element if not defined before ([8c75cd1](https://github.com/heiseonline/embetty/commit/8c75cd1cf004ecd5ee06c59cf5d703ff09cc013b))
- upgrade deps ([40f9abc](https://github.com/heiseonline/embetty/commit/40f9abc19fd4bcdc9d7823f96ad963e58b6a3dde))

# embetty

## v3.0.3, 2020-04-29

- Replaced Embetty SVG with a smaller version

## v3.0.2, 2020-02-24

- Added missing build artifacts.

## v3.0.1, 2020-02-24

- Default posterimage for Facebook is now empty.
- Attribute `poster-image` was added to overwrite poster images.
- Upgraded dependencies.

This release contains breaking changes:

- Dropped support for Node.js v8.

## v2.0.3, 2019-11-05

- Upgrading to Babel 7 introduced an uglifier bug. Fixed.

## v2.0.2, 2019-11-04

- Fixed broken embetty logo in embeds.

## v2.0.1, 2019-11-04

- Upgraded Babel to v7.

## v2.0.0, 2019-11-04

- embetty no longer includes the Twitter-thread by default
- a new attribute `include-thread` was added to re-enable threads

## v1.2.0, 2019-09-09

- improve video play button visibility

## v1.1.11, 2019-08-29

- fix branch not permitted

## v1.1.10, 2019-08-29

- update password for auto-build

## v1.1.9, 2019-08-29

- Debug npm release

## v1.1.8, 2019-08-29

- Fix by @leto to adjust to new Twitter API.

## v1.1.7, 2019-06-11

- Upgraded dependencies.

## v1.1.6, 2019-03-08

- Replaced play button.
- Removed background gradient.
- Updated YouTube `iframe` code.
- Upgraded dependencies.

## v1.1.5, 2018-11-08

- Fixed video styles.

## v1.1.4, 2018-10-25

- Upgraded dependencies.
- Improved tests to support Node versions 8 and 10.

## v1.1.3, 2018-08-31

- Fixed YouTube videos not supporting fullscreen display.
- Upgraded dependencies.

## v1.1.2, 2018-08-22

- Fixed deployment to npmjs.com.

## v1.1.1, 2018-08-21

- Fixed hash tag error supporting all characters.

## v1.1.0, 2018-06-27

- Added events section to readme.
- Added caveats section to readme.
- Added `activated` event to videos. (rbraband)
- Added support for `start-at` to youtube and vimeo videos.
- Fixed images in tweets being cut off on the left side. (rbraband)
- Upgraded dependencies.

## v1.0.6, 2018-06-07

- Added link to [demo](https://heiseonline.github.io/embetty/) to readme. (schliflo)
- Added testing for latest node.js version. (DanielRuf)
- Fixed video poster CSS. (rbraband)
- Improved build process. (DanielRuf)
- Improved Vimeo and Facebook videos to autoplay after being klicked on.
- Improved Youtube integration to use [privacy-enhanced mode](https://support.google.com/youtube/answer/171780?hl=en).
- Upgraded dependencies.

## v1.0.5, 2018-05-28

- Fixed release process.

## v1.0.4, 2018-05-22

- Fixed error handling for tweets without link preview images.
- Improved the design on smaller viewports.

## v1.0.3, 2018-05-16

- Fixed layout for links without images.

## v1.0.2, 2018-05-08

- Do not display the powered by link in answered tweets.
- Fixed layout bugs.
- Fixed powered by link.

## v1.0.1, 2018-05-03

- Fixed `assets` folder not being published to npm registry.

## v1.0.0, 2018-05-03

- Added powered by link.

## v1.0.0-beta.11, 2018-04-19

- Upgraded dependencies.

## v1.0.0-beta.10, 2018-04-06

- Upgraded dependencies.

## v1.0.0-beta.9, 2018-02-21

- SCSS files are now explicitly included in the components with the necessary webpack configuration to simplify building in dependant modules. For this reason, the loaders involved are now prod dependencies.
- Upgraded dependencies.

## v1.0.0-beta.8, 2018-02-07

- Fixed "Mixed Content" error when playing a Youtube video.
- Links are now opened in a new tab.
- Improved documentation.

## v1.0.0-beta.7, 2018-01-29

- Added missing `skip_cleanup: true` to Travis CI config.

## v1.0.0-beta.6, 2018-01-29

- Added missing `yarn build` to Travis CI config.

## v1.0.0-beta.5, 2018-01-29

- Removed `engines.node` property from `package.json`.
- Upgraded dependencies.

## v1.0.0-beta.4, 2018-01-29

- Added missing `files` configuration so that the `dist` directory is published.

## v1.0.0-beta.3, 2018-01-26

- Fixed Travis CI.

## v1.0.0-beta.2, 2018-01-26

- Added missing Travis setup.
- Fixed broken tests.

## v1.0.0-beta, 2018-01-26

- Initial release
