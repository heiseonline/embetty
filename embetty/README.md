# embetty 
Embetty displays remote content like tweets or videos without compromising your privacy.

<p align="center">
  <img alt="Embetty" src="/embetty.png" width="360">
</p>

See it in action on our [demo pages](https://heiseonline.github.io/embetty/).

## Quick Start

1. Setup your [embetty-server](https://github.com/heiseonline/embetty-server).
2. Include the embetty lib into your HTML document.
3. Insert an embed by using a custom tag (see embeds section below).

Example:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta data-embetty-server="/path/to/embetty-server" />
    <script async src="embetty.js"></script>
  </head>
  <body>
    <embetty-tweet status="1166685910030790662"></embetty-tweet>
  </body>
</html>
```

## Documentation

### Configure the Embetty server

Embetty needs a [server component](https://github.com/heiseonline/embetty-server) that you need to run on your infrastructure. Configure the server URL for embetty using a `<meta data-embetty-server>` tag:

```html
<head>
  <meta data-embetty-server="/path/to/embetty-server" />
</head>
```

### Including embetty.js

There are three options.

1. Download an Embetty archive from the [releases page](https://github.com/heiseonline/embetty/releases). Make `embetty.js` available on your site.
2. Use Embetty in your npm project: `yarn add @embetty/component` or `npm install @embetty/component --save`. Then import embetty into your main script (i.e. `import '@embetty/component'`).
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

Use the `include-thread` attribute to include the thread _above_ the tweet (i.e. the conversation so far, for context). Example:

```html
<embetty-tweet status="950371792874557440" include-thread></embetty-tweet>
```

#### Video

Use the `type` attribute with a value of `facebook`, `vimeo` or `youtube`. Set the `video-id` attribute to the video ID.

```html
<embetty-video type="facebook" video-id="10156049485672318"></embetty-video>
```

Use the `poster-image` attribute with an URL. This overwrites the preview image of the video.

```html
<embetty-video
  type="facebook"
  video-id="10156049485672318"
  poster-image="www.test.com/image.jpg"
></embetty-video>
```

For videos of type `vimeo` or `youtube`, it's also possible to set a `start-at` attribute with a value of time in seconds to start the video at a specific timecode.

```html
<embetty-video
  type="youtube"
  start-at="96"
  video-id="3L4fHrIJ3A4"
></embetty-video>
<embetty-video type="vimeo" start-at="96" video-id="223099532"></embetty-video>
```

#### Mastodon Status

Use the `status` attribute with the link of the corresponding status. Embetty will retrieve the data from the corresponding Mastodon instance.

```html
<embetty-mastodon
  status="https://social.heise.de/@heiseonline/110372412617177781"
></embetty-mastodon>
```

### Events

Embetty triggers the following events:

| Name          | Description                                                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initialized` | The Embetty embed will enter the viewport _after_ this has been triggered.                                                                         |
| `activated`   | The Embetty **video** embed has been replaced with an iframe containing the original video player. The content of the iframe may still be loading. |

Example code:

```js
document.querySelector('embetty-tweet').addEventListener('initialized', function(e) { ... })
```

## Testing

1. Clone this repository.
2. `yarn`
3. export the `TWITTER_` tokens mentioned in https://github.com/heiseonline/embetty-server
4. `yarn test`

## Caveats

The Embetty server component **does not proxy video data**. This means that **the tracking protection becomes ineffective after the play button has been clicked**.

## License

Embetty is [MIT licensed](./LICENSE).
