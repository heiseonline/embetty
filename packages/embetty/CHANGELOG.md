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
