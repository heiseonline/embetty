# embetty-base · [![Build Status](https://travis-ci.org/heiseonline/embetty-base.svg?branch=master)](https://travis-ci.org/heiseonline/embetty-base)  [![Dependency Status](https://david-dm.org/heiseonline/embetty-base.svg)](https://david-dm.org/heiseonline/embetty-base) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[Embetty](https://github.com/heiseonline/embetty) displays remote content like tweets or YouTube videos without compromising your privacy. `embetty-base` is the API used to retrieve the necessary data.

## Quick Start

### Install

```sh
$ npm install @heise/embetty-base
```

or

```sh
$ yarn add @heise/embetty-base
```

### Basic Usage

```js
const Embetty = require('@heise/embetty-base')

const embetty = new Embetty()
const tweet = await embetty.loadTweet(someStatusId)
```

### Using the cache

By default, remote service responses are stored in an LRU cache. The engine can be selected by defining the environment variable `EMBETTY_CACHE`. Example:

```sh
$ export EMBETTY_CACHE=redis://
```

## Running tests

```sh
$ yarn test
```

## Debug

You can set the `DEBUG` env to `embetty.*` to print debug info:

```sh
$ export DEBUG=embetty.*
```

## License

embetty-base is [MIT licensed](./LICENSE).
