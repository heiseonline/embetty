# embetty-server · [![Build Status](https://travis-ci.org/heiseonline/embetty-server.svg?branch=master)](https://travis-ci.org/heiseonline/embetty-server) [![Dependency Status](https://img.shields.io/david/heiseonline/embetty-server.svg?style=flat-square)](https://david-dm.org/heiseonline/embetty-server) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

[Embetty](https://github.com/heiseonline/embetty) displays remote content like tweets or YouTube videos without compromising your privacy. `embetty-server` acts as a proxy and provides the necessary data.

<p align="center">
  <img alt="Embetty" src="assets/embetty.png" width="360">
</p>

Embetty server can be run in two different ways:

- Use the [official Docker image](https://hub.docker.com/r/heiseonline/embetty-server/) to run it in a container.
- [Install it directly and use a process manager](#running-embetty-server-with-a-process-manager).

It's necessary to configure a reverse proxy to make Embetty server reachable either way.

## Running Embetty server with Docker

The docker image exposes the server on port `8080` and can be [configured](#configuration) using environment variables.

```sh
$ docker run \
  -p 8080:8080 \
  --name embetty \
  --rm \
  -e VALID_ORIGINS=https://example.com \
  -e TWITTER_ACCESS_TOKEN_KEY=... \
  -e TWITTER_ACCESS_TOKEN_SECRET=... \
  -e TWITTER_CONSUMER_KEY=... \
  -e TWITTER_CONSUMER_SECRET=... \
  heiseonline/embetty-server:latest
```

## Running Embetty server with a process manager

This requires Node.js version 8 or later.

1. Install Embetty server by running `yarn global add @embetty/server`. This makes the `embetty` command available on the server.
2. Setup a process manager like [Forever](https://github.com/foreverjs/forever), [PM2](https://github.com/Unitech/pm2) or [StrongLoop Process Manager](http://strong-pm.io/).
3. Configure the Process manager to run `embetty start`. The command `embetty start --help` prints a list of all supported options.

## Configuration

Embetty server can be configured using the following environment variables:

| Variable                      | Required        | Description                                                                                                                                                                                                    |
| ----------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `URL_BASE`                    | no              | The base URL of the Embetty server instance, e.g. `https://my-server.com/path/to/embetty`.                                                                                                                     |
| `DEBUG`                       | no              | This variable controls the output of log messages. You may set it to `embetty.*` to log all Embetty messages to `STDOUT`.                                                                                      |
| `EMBETTY_CACHE`               | no              | Connection string of a cache adapter. Currently [Redis](https://www.iana.org/assignments/uri-schemes/prov/redis) (example: `redis://`) and LRU (example: `lru://`) are supported.                              |
| `PORT`                        | no              | This variable can be used to specify the port on which Embetty Server listens. Default: `3000`                                                                                                                 |
| `TWITTER_ACCESS_TOKEN_KEY`    | [[1](#twitter)] | Twitter Access Token                                                                                                                                                                                           |
| `TWITTER_ACCESS_TOKEN_SECRET` | [[1](#twitter)] | Twitter Access Token Secret                                                                                                                                                                                    |
| `TWITTER_CONSUMER_KEY`        | [[1](#twitter)] | Twitter consumer Key (API Key)                                                                                                                                                                                 |
| `TWITTER_CONSUMER_SECRET`     | [[1](#twitter)] | Twitter consumer Secret (API Secret)                                                                                                                                                                           |
| `VALID_ORIGINS`               | yes             | Contains a comma-separated list of allowed [origins](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin). Examples: `https://example.com`, `https://a.example.com,https://b.example.com` or `*`. |

### Twitter

To display tweets with Embetty, the Twitter environment variables [listed above](#configuration) need to be defined. Both tokens, the key and the secret can be obtained by creating a [Twitter app](https://apps.twitter.com/).

## Testing the server setup

The setup can be tested by sending a request to the running server. If everything was set up correctly, JSON data and the HTTP status code `200` are returned.

```sh
$ curl -i http://localhost:8080/version
$ curl -i http://localhost:8080/tweet/985882036777955328
$ curl -i http://localhost:8080/video/youtube/m6UOo2YGbIE-poster-image
```

## Using Embetty with Google AMP ⚡️

Embetty server supports Google AMP ⚡️ out of the box via `<amp-iframe>`:

Tweet:

```html
<amp-iframe
  width="200"
  height="100"
  sandbox="allow-scripts allow-same-origin"
  layout="responsive"
  resizable
  frameborder="0"
  src="https://your-site.com/path/to/embetty-server/tweet/1004988454978179072.amp"
>
  <div overflow tabindex="0" role="button" aria-label=""></div>
</amp-iframe>
```

Vimeo:

```html
<amp-iframe
  width="200"
  height="100"
  sandbox="allow-scripts allow-same-origin"
  layout="responsive"
  resizable
  frameborder="0"
  src="https://your-site.com/path/to/embetty-server/video/vimeo/1084537.amp"
>
  <div overflow tabindex="0" role="button" aria-label=""></div>
</amp-iframe>
```

YouTube:

```html
<amp-iframe
  width="200"
  height="100"
  sandbox="allow-scripts allow-same-origin"
  layout="responsive"
  resizable
  frameborder="0"
  src="https://your-site.com/path/to/embetty-server/video/youtube/m6UOo2YGbIE.amp"
>
  <div overflow tabindex="0" role="button" aria-label=""></div>
</amp-iframe>
```

Facebook:

```html
<amp-iframe
  width="200"
  height="100"
  sandbox="allow-scripts allow-same-origin"
  layout="responsive"
  resizable
  frameborder="0"
  src="https://your-site.com/path/to/embetty-server/video/facebook/10156049485672318.amp"
>
  <div overflow tabindex="0" role="button" aria-label=""></div>
</amp-iframe>
```

## Contributing to Embetty

See [Contributing](./CONTRIBUTING.md).

## License

Embetty server is [MIT licensed](./LICENSE).
