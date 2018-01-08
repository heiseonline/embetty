# embetty-server  · [![Build Status](https://travis-ci.org/heiseonline/embetty-server.svg?branch=master)](https://travis-ci.org/heiseonline/embetty-server) [![Greenkeeper badge](https://badges.greenkeeper.io/heiseonline/embetty-server.svg)](https://greenkeeper.io/) [![Dependency Status](https://img.shields.io/david/heiseonline/embetty-server.svg?style=flat-square)](https://david-dm.org/heiseonline/embetty-server) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[Embetty](https://github.com/heiseonline/embetty) displays remote content like tweets or YouTube videos without compromising your privacy. `embetty-server` acts as a proxy and provides the necessary data.

## Starting the Embetty Server

```sh
$ npm install
$ npm start
```

or

```sh
$ yarn
$ yarn start
```

## Configuration

| Variable | Description |
|----------|-------------|
| `DEBUG` | This variable controls the output of log messages. You may set it to `embetty.*` to log all Embetty messages to `STDOUT`. |
| `EMBETTY_CACHE`| Connection string of a cache adapter. Currently [Redis](https://www.iana.org/assignments/uri-schemes/prov/redis) (example: `redis://`) and LRU (example: `lru://`) are supported. |
| `NODE_ENV` | This variable should be set to `production` in production environments. |
| `PORT` | This variable can be used to specify the port on which Embetty Server listens. Default: `3000` |
| `VALID_ORIGINS` | Contains a comma-separated list of allowed [origins](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin). Must be specified. Examples: `https://example.com`, `https://a.example.com,https://b.example.com` or `*`. |

## Running the tests

```sh
$ yarn test
```

# License

embetty-server is [MIT licensed](./LICENSE).
