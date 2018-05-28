# embetty · [![Build Status](https://travis-ci.org/heiseonline/embetty.svg?branch=master)](https://travis-ci.org/heiseonline/embetty) [![Greenkeeper badge](https://badges.greenkeeper.io/heiseonline/embetty.svg)](https://greenkeeper.io/) [![Dependency Status](https://img.shields.io/david/heiseonline/embetty.svg?style=flat-square)](https://david-dm.org/heiseonline/embetty) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

<p align="center">
  <img alt="Embetty" src="assets/embetty.png" width="360">
</p>

Embetty displays remote content like tweets or YouTube videos without compromising your privacy.

## Quick Start

1. Setup your [embetty-server](https://github.com/heiseonline/embetty-server).
3. Include the embetty lib into your HTML document.
4. Insert an embed by using a custom tag (see embeds section below).

Example:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta data-embetty-server="/path/to/embetty-server">
  <script async src="embetty.js"></script>
</head>
<body>
  <embetty-tweet status="950371792874557440"></embetty-tweet>
</body>
</html>
```

## Documentation

### Configure the Embetty server

Embetty needs a [server component](https://github.com/heiseonline/embetty-server) that you need to run on your infrastructure. Configure the server URL for embetty using a `<meta data-embetty-server>` tag:

```html
<head>
  <meta data-embetty-server="/path/to/embetty-server">
</head>
```

### Including embetty.js

There are three options.

1. Download an Embetty archive from the [releases page](https://github.com/heiseonline/embetty/releases). Make `./embetty.js` available on your site.
2. Use Embetty in your npm project: `yarn add @heise/embetty` or `npm install @heise/embetty --save`. Then import embetty into your main script (i.e. `import '@heise/embetty'`).
3. Clone this repository and build `./dist/embetty.js`:
   ```sh
   $ git clone https://github.com/heiseonline/embetty
   $ cd embetty
   $ yarn
   $ yarn build
   ``` 

### Supported embed types

Currently, tweets and various video platforms are supported.

#### Tweet

Use the `status` attribute to embed a tweet with its tweet ID. Example:

```html
<embetty-tweet status="950371792874557440"></embetty-tweet>
```

#### Video

Use the `type` attribute with a value of `facebook`, `vimeo` or `youtube`. Set the `video-id` attribute to the video ID.

```html
<embetty-video type="youtube" video-id="3L4fHrIJ3A4"></embetty-video>
<embetty-video type="vimeo" video-id="223099532"></embetty-video>
<embetty-video type="facebook" video-id="10156049485672318"></embetty-video>
```

## License

Embetty is [MIT licensed](./LICENSE).
