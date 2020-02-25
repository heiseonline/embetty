# Changelog

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
