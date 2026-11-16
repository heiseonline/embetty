---
'@embetty/server': major
---

- AMP pages are rendered without nunjucks.
- AMP video pages pass only the `start-at`, `poster-image`, `width` and `height` query parameters on to `<embetty-video>`. Before, every query parameter became an attribute, including event handlers such as `onmouseover`.
- A `URL_BASE` with a path (e.g. `https://example.com/embetty`) no longer loses its last path segment in AMP pages.
