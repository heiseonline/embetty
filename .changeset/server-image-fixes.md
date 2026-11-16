---
'@embetty/server': patch
---

- Mastodon image routes answer 404 when the status has no such image (e.g. no link preview) instead of 400.
- The Docker image contains only the built packages and their runtime dependencies, no sources or local files from the build context.
