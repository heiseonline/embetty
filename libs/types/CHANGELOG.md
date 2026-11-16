# @embetty/types

## 3.0.0

### Major Changes

- e955bba: Packages are built with Bun instead of tsc and webpack.
  
  - `@embetty/base` and `@embetty/types` ship one bundled CommonJS file plus declarations and declare `exports`; deep imports such as `@embetty/base/src/...` no longer work.
  - `@embetty/component` ships a minified IIFE bundle (`dist/embetty.js`) that targets current browsers; it no longer declares `engines`.
  - `@embetty/server`: `npm start` runs `dist/server.js` (the referenced `bin/www` did not exist), and `dotenv` is no longer a dependency; set environment variables directly.
- 60c0bfa: - `@embetty/base`: the LRU cache now honors `max` from `EMBETTY_CACHE` (e.g. `lru://max:500`); it was always 100 before. `TwitterErrorType` is a plain object instead of a TypeScript enum.
  - `@embetty/types`: Mastodon fields typed as `any` now have their actual types, including `null` where the API returns it.
  - `@embetty/component`: errors while loading an embed are logged instead of surfacing as unhandled rejections.

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

- c18a469: fix embetty-server cli

## 2.0.1

### Patch Changes

- 0a576aa: fix npm package contents

## 2.0.0

### Major Changes

- d3548b9: Configured embetty mono-repo and migrated embetty-tweet to Twitter API V2
