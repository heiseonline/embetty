# embetty

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
