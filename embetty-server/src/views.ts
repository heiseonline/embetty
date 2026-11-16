// HTML for AMP iframes. Interpolated values are escaped unless they are
// already Html, so markup can only come from these templates.

export class Html {
  constructor(readonly value: string) {}

  toString() {
    return this.value
  }
}

const ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const escape = (value: unknown): string =>
  value instanceof Html
    ? value.value
    : String(value).replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char)

// Not named `html`: formatters would reformat the markup inside.
export const markup = (
  strings: TemplateStringsArray,
  ...values: readonly unknown[]
): Html =>
  new Html(
    strings.reduce(
      (out, string, index) => out + escape(values[index - 1]) + string,
    ),
  )

function urlFor(path: string): string {
  const base = process.env.URL_BASE || 'http://localhost:3000'
  // Without the trailing slash, a base path's last segment would be replaced.
  const url = new URL(path, base.endsWith('/') ? base : `${base}/`)
  return url.toString().replace(/\/$/, '')
}

function layout(embed: Html): string {
  return markup`<!DOCTYPE html>
<html>
  <head>
    <meta data-embetty-server="${urlFor('./')}" />
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>

  <body>
    ${embed}
    <script>
      var counter = 0
      var interval
      function postHeight() {
        window.parent.postMessage(
          {
            sentinel: 'amp',
            type: 'embed-size',
            height: document.body.scrollHeight,
          },
          '*',
        )
        if (++counter === 200) clearInterval(interval)
      }

      document
        .querySelector('embetty-tweet,embetty-video,embetty-mastodon')
        .addEventListener('initialized', function (e) {
          interval = setInterval(postHeight, 100)
        })
    </script>
    <script async src="${urlFor('./embetty.js')}"></script>
  </body>
</html>
`.value
}

// Attribute names cannot be escaped, so only those the component reads from
// AMP pages are passed on; anything else could add an event handler.
const VIDEO_ATTRIBUTES = ['start-at', 'poster-image'] as const

export interface VideoView {
  type: string
  id: string
}

export function videoPage(
  { type, id }: VideoView,
  query: Readonly<Record<string, unknown>> = {},
): string {
  const attributes = VIDEO_ATTRIBUTES.flatMap((name) => {
    const value = query[name]
    return typeof value === 'string' ? [markup` ${name}="${value}"`] : []
  })

  return layout(
    markup`<embetty-video type="${type}" video-id="${id}"${new Html(attributes.join(''))}></embetty-video>`,
  )
}

export const tweetPage = (id: string): string =>
  layout(markup`<embetty-tweet include-thread status="${id}"></embetty-tweet>`)

export const mastodonPage = (id: string): string =>
  layout(markup`<embetty-mastodon status="${id}"></embetty-mastodon>`)
