# embetty · [![Build Status](https://travis-ci.org/heiseonline/embetty-server.svg?branch=master)](https://travis-ci.org/heiseonline/embetty) [![Greenkeeper badge](https://badges.greenkeeper.io/heiseonline/embetty.svg)](https://greenkeeper.io/) [![Dependency Status](https://img.shields.io/david/heiseonline/embetty.svg?style=flat-square)](https://david-dm.org/heiseonline/embetty) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

<p align="center">
  <img alt="Embetty" src="assets/embetty.png" width="360">
</p>


## Quick Start

1. Setup your [embetty-server](https://github.com/heiseonline/embetty-server).
2. Include the embetty lib into your HTML document.
3. Insert an embed by using a custom tag (see embeds section below).

Example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <script async src="embetty.js"></script>
</head>
<body>
  <embetty-tweet status="950371792874557440"></embetty-tweet>
</body>
</html>
```

## Embeds

Currently, tweets and various video platforms are supported.

### Tweet

Use the `status` attribute to embed a tweet with its tweet ID. Example:

```html
<embetty-video type="vimeo" video-id="223099532"></embetty-video>
```

### Video

Use the `type` attribute with a value of `facebook`, `vimeo` or `youtube`. Set the `video-id` attribute to the video ID.

```html
<embetty-video type="youtube" video-id="3L4fHrIJ3A4"></embetty-video>
<embetty-video type="vimeo" video-id="223099532"></embetty-video>
<embetty-video type="facebook" video-id="10156049485672318"></embetty-video>
```

## License

Embetty is [MIT licensed](./LICENSE).
