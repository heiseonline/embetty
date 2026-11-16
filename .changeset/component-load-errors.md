---
'@embetty/component': patch
---

When the Embetty server answers with an error (e.g. 404 for a deleted tweet), the component logs an `EmbedLoadError` naming the URL and status instead of a JSON parse error.
